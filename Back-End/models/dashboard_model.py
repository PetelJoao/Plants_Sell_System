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
    supabase = get_supabase_admin()

    # Busca os paths dos ficheiros antes de deletar
    planta = supabase.table("planta").select("imagens, plantas_arquivo").eq("id", plant_id).single().execute()
    
    imagens = planta.data.get("imagens", []) or []
    arquivos = planta.data.get("plantas_arquivo", []) or []

    # Extrai os paths das URLs públicas das imagens
    def url_to_path(url: str) -> str:
        # A URL pública tem formato: .../storage/v1/object/public/PlansStoraga/PATH
        return url.split("/PlansStoraga/")[-1]

    image_paths   = [url_to_path(u) for u in imagens]
    archive_paths = arquivos  # já são paths directos

    all_paths = f'{image_paths} + {archive_paths}'
    if all_paths:
        supabase.storage.from_("PlansStoraga").remove(all_paths)

    # Deleta o registo
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