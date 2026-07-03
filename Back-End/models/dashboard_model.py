import datetime
import traceback
from fastapi import UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
from models.db import get_supabase_admin


async def all_plants():
    supabase = get_supabase_admin()
    response = supabase.table("planta").select("*").execute()
    return response.data


async def DeletePlants(plant_id: str):

    """
    Esta Func realizar 3 ações principais:
    1. Recuperar os dados da planta do BD usando o plant_id fornecida.
    2. Extrair os caminhos dos arquivos das plantas como também das imagens associadas a planta.
    3. Deletar os arquivos das plantas do armazenamentoe
    """
    supabase = get_supabase_admin()
    
    planta = supabase.table("planta").select("imagens, plantas_arquivo").eq("id", plant_id).single().execute()

    if not planta.data:
        raise HTTPException(status_code=404, detail="Planta não encontrada.")
    
    imagens = planta.data.get("imagens", []) or []
    arquivos = planta.data.get("plantas_arquivo", []) or []

  
    def url_to_path(url: str) -> str:
      
        return url.split("/PlansStoraga/")[-1]

    image_paths   = [url_to_path(u) for u in imagens]
    archive_paths = arquivos 

    all_paths = image_paths + archive_paths
    if all_paths:
        supabase.storage.from_("PlansStoraga").remove(all_paths)

    response = supabase.table("planta").delete().eq("id", plant_id).execute()

    return JSONResponse(status_code=200, content={"message": "Planta e ficheiros deletados", "data": response.data})

async def ManagePlants(user: dict):
    supabase = get_supabase_admin()
    response = supabase.from_("dashboard_gestao_plantas").select("*").eq("arquiteto_id", user["id"]).execute()
    if not response.data:
        return {
            "arquiteto_id":       user["id"],
            "saldo_disponivel":   0,
            "total_plantas":      0,
            "plantas_ativas":     0,
            "plantas_inativas":   0,
            "plantas_vendidas":   0,
            "receita_total":      0,
            "progresso_elite_pct": 0,
            "faltam_para_elite":  10000,
        }

    return response.data[0]
    
    return response.data

async def MyPlants(user: dict):
    supabase = get_supabase_admin()
    response = supabase.table("planta").select("*").eq("dono", user["id"]).execute()
    
    return response.data

async def upload_plants(
    user_id:      str,
    title:        str,
    description:  Optional[str]       = None,
    topology:     Optional[str]       = None,
    category:     Optional[str]       = None,
    squareFeet:   Optional[str]       = None,
    bedrooms:     Optional[int]       = 0,
    bathrooms:    Optional[int]       = 0,
    price:        float               = 0,
    imageFiles:   List[UploadFile]    = File(default=[]),   # ← alinhado
    projectFiles: List[UploadFile]    = File(default=[]),   # ← alinhado
):
    if not imageFiles:
        raise HTTPException(status_code=422, detail="Nenhuma imagem pública enviada.")
    if not projectFiles:
        raise HTTPException(status_code=422, detail="Nenhum arquivo de projeto enviado.")

    try:

        supabase = get_supabase_admin()
        timestamp = datetime.datetime.now().strftime("%d%m%Y_%H%M%S")
        image_urls: List[str] = []

        for img in imageFiles:
            contents  = await img.read()
            file_path = f"plantas/{user_id}/{timestamp}/imagens/{img.filename}"

            supabase.storage.from_("PlansStoraga").upload(
                path=file_path,
                file=contents,
                file_options={"content-type": img.content_type},
            )

            url = supabase.storage.from_("PlansStoraga").get_public_url(file_path)
            image_urls.append(url)
         
       
        project_file_urls: List[str] = []

        for doc in projectFiles:
            contents  = await doc.read()
            file_path = f"plantas/{user_id}/{timestamp}/projeto/{doc.filename}"

            supabase.storage.from_("PlansStoraga").upload(
                path=file_path,
                file=contents,
                file_options={"content-type": doc.content_type ,"upsert": "true"},
            )

            project_file_urls.append(file_path)
    
 
        planta_db = {
            "nome":             title,
            "descricao":        description,
            "dimensao":         squareFeet,
            "dono":             user_id,
            "orcamento":        price,
            "imagens":          image_urls,
            "plantas_arquivo":  project_file_urls,
            "estado":           "ativo",        
            "categoria":        category,
            "quartos":          bedrooms,
            "banheiros":        bathrooms,     
            "tipologia":        topology,
        }

        response = supabase.table("planta").insert(planta_db).execute()

        return JSONResponse(
            status_code=201,
            content={
                "message":       "Planta cadastrada com sucesso!",
                "data":          response.data,
                "imagens_count": len(image_urls),
                "docs_count":    len(project_file_urls),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        print("=" * 60)
        print("ERRO em upload_plants:")
        traceback.print_exc()
        print("=" * 60)
        raise HTTPException(status_code=500, detail=str(e))


async def EditPlants(
    plant_id:     str,
    title:        str,
    description:  Optional[str]    = None,
    topology:     Optional[str]    = None,
    category:     Optional[str]    = None,
    squareFeet:   Optional[str]    = None,
    bedrooms:     Optional[int]    = 0,
    bathrooms:    Optional[int]    = 0,
    price:        float            = 0,
    imageFiles:   List[UploadFile] = [],
    projectFiles: List[UploadFile] = [],
):
    try:
        supabase = get_supabase_admin()

        # 1. Buscar a planta actual para obter owner e ficheiros existentes
        planta_atual = (
            supabase.table("planta")
            .select("dono, imagens, plantas_arquivo")
            .eq("id", plant_id)
            .single()
            .execute()
        )

        if not planta_atual.data:
            raise HTTPException(status_code=404, detail="Planta não encontrada.")

        dono            = planta_atual.data.get("dono")
        imagens_atuais  = planta_atual.data.get("imagens", [])        or []
        arquivos_atuais = planta_atual.data.get("plantas_arquivo", []) or []

        timestamp = datetime.datetime.now().strftime("%d%m%Y_%H%M%S")

        # ── IMAGENS ──────────────────────────────────────────────────────────
        if imageFiles:
            # Apagar imagens antigas do Storage
            def url_to_path(url: str) -> str:
                return url.split("/PlansStoraga/")[-1]

            old_image_paths = [url_to_path(u) for u in imagens_atuais if u]
            if old_image_paths:
                supabase.storage.from_("PlansStoraga").remove(old_image_paths)

            # Upload das novas imagens
            image_urls: List[str] = []
            for img in imageFiles:
                contents  = await img.read()
                file_path = f"plantas/{dono}/{timestamp}/imagens/{img.filename}"

                supabase.storage.from_("PlansStoraga").upload(
                    path=file_path,
                    file=contents,
                    file_options={"content-type": img.content_type},
                )

                url = supabase.storage.from_("PlansStoraga").get_public_url(file_path)
                image_urls.append(url)
        else:
            # Sem novas imagens → manter as existentes
            image_urls = imagens_atuais

        # ── FICHEIROS DE PROJECTO ─────────────────────────────────────────────
        if projectFiles:
            # Apagar ficheiros de projecto antigos do Storage
            if arquivos_atuais:
                supabase.storage.from_("PlansStoraga").remove(arquivos_atuais)

            # Upload dos novos ficheiros
            project_file_urls: List[str] = []
            for doc in projectFiles:
                contents  = await doc.read()
                file_path = f"plantas/{dono}/{timestamp}/projeto/{doc.filename}"

                supabase.storage.from_("PlansStoraga").upload(
                    path=file_path,
                    file=contents,
                    file_options={"content-type": doc.content_type, "upsert": "true"},
                )

                project_file_urls.append(file_path)
        else:
            # Sem novos ficheiros → manter os existentes
            project_file_urls = arquivos_atuais

        # ── UPDATE NA TABELA ─────────────────────────────────────────────────
        # model EditPlants — só atualizar tipologia se vier preenchida
        planta_update = {
            "nome":            title,
            "descricao":       description,
            "dimensao":        squareFeet,
            "orcamento":       price,
            "categoria":       category,
            "quartos":         bedrooms,
            "banheiros":       bathrooms,
            "imagens":         image_urls,
            "plantas_arquivo": project_file_urls,
        }

     
        if topology:
            planta_update["tipologia"] = topology

        response = (
            supabase.table("planta")
            .update(planta_update)
            .eq("id", plant_id)
            .execute()
        )

        return JSONResponse(
            status_code=200,
            content={
                "message": "Planta atualizada com sucesso!",
                "data":    response.data,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        print("=" * 60)
        print("ERRO em EditPlants:")
        traceback.print_exc()
        print("=" * 60)
        raise HTTPException(status_code=500, detail=str(e))

async def get_historico_compras(usuario_id: str):

    supabase = get_supabase_admin()

    query = (
        supabase.table("vw_compras_usuario")
        .select("*")
        .eq("comprador_id", usuario_id)
    )
    status = "pendente"
    if status:
        query = query.eq("status", status)

    result = query.order("comprado_em", desc=True).execute()

    return {
       "total": len(result.data),
        "compras": result.data,
    }

async def get_download_urls(plant_id: str, buyer_user_id: str):
  
    supabase = get_supabase_admin()

    purchase = supabase.table("compra") \
        .select("*") \
        .eq("planta_id", plant_id) \
        .eq("cliente_id", buyer_user_id) \
        .eq("status", "pendente") \
        .execute()

    if not purchase.data:
        raise HTTPException(status_code=403, detail="Compra não confirmada para este utilizador.")

    planta = supabase.table("planta") \
        .select("plantas_arquivo") \
        .eq("id", plant_id) \
        .single() \
        .execute()

    if not planta.data:
        raise HTTPException(status_code=404, detail="Planta não encontrada.")

    paths = planta.data.get("plantas_arquivo")
    
    if not paths:
        raise HTTPException(
            status_code=404,
            detail="Nenhum ficheiro técnico disponível para esta planta.",
        )
    
    

    signed_urls = []
    for path in paths:
        result = supabase.storage.from_("PlansStoraga").create_signed_url(
            path=path,
            expires_in=3600,
        )
        signed_urls.append({
            "filename": path.split("/")[-1],
            "url":      result["signedURL"],
        })

    return {"download_urls": signed_urls}

async def SendRP(report, user_id: str):
    supabase = get_supabase_admin()
    Denunciador = supabase.table("usuario").select("nome").eq("id", user_id).single().execute()
    report_data = {
        "nome": Denunciador.data["nome"] if Denunciador.data else "Desconhecido",
        "id_planta": report.get("Denunciado", ""),
        "categoria": report.get("categoria_denuncia", ""),
        "descricao": report.get("descricao", ""),
        "data_registro": report.get("data", ""),
        "estado": report.get("estado", ""),
        
    }

    response = supabase.table("denuncia").insert(report_data).execute()

    return JSONResponse(
        status_code=201,
        content={"message": "Relatório enviado com sucesso!", "data": response.data},
    )