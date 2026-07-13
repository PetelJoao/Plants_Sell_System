import datetime
import json
import json
import traceback
import asyncio
from functools import partial
from fastapi import UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
import io
import zipfile

from fastapi.responses import StreamingResponse

from models.db import get_supabase_admin


async def run_query(fn):

    return await asyncio.to_thread(fn)

async def all_plants():
    supabase = get_supabase_admin()

    response = await  run_query(lambda: supabase.table("planta").select("*").execute())

    return response.data


async def DeletePlants(plant_id: str):

    """
    Esta Func realizar 3 ações principais:
    1. Recuperar os dados da planta do BD usando o plant_id fornecida.
    2. Extrair os caminhos dos arquivos das plantas como também das imagens associadas a planta.
    3. Deletar os arquivos das plantas do armazenamentoe
    """
    supabase = get_supabase_admin()
    
    planta = await run_query(lambda: (
        supabase.table("planta")
        .select("imagens, plantas_arquivo")
        .eq("id", plant_id)
        .single()
        .execute()
    ))


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
    response = await run_query(lambda: supabase.from_("dashboard_gestao_plantas").select("*").eq("arquiteto_id", user["id"]).execute()
    )
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
    

async def MyPlants(user: dict):
    supabase = get_supabase_admin()

    response = await run_query(lambda: (
        supabase.table("planta")
        .select("*")
        .eq("dono", user["id"])
        .execute()
    ))
    
    return response.data

async def upload_plants(
    user_id:      str,
    title:        str,
    description:  Optional[str]       = None,
    category:     Optional[str]       = None,
    squareFeet:   Optional[str]       = None,
    price:        float               = 0,
    especificacoes: Optional[str]       = Form(default=None), 
    imageFiles:   List[UploadFile]    = File(default=[]),   # ← alinhado
    projectFiles: List[UploadFile]    = File(default=[]),   # ← alinhado
):
    if not imageFiles:
        raise HTTPException(status_code=422, detail="Nenhuma imagem pública enviada.")
    if not projectFiles:
        raise HTTPException(status_code=422, detail="Nenhum arquivo de projeto enviado.")


    especificacoes_dict = None
    if especificacoes:
        try:
            especificacoes_dict = json.loads(especificacoes)
        except json.JSONDecodeError:
            raise HTTPException(status_code=422, detail="Campo 'especificacoes' não é um JSON válido.")
        
    try:

        supabase = get_supabase_admin()
        timestamp = datetime.datetime.now().strftime("%d%m%Y_%H%M%S")
        image_urls: List[str] = []
        project_file_urls: List[str] = []

        image_contents = [await img.read() for img in imageFiles]
        project_contents = [await doc.read() for doc in projectFiles]
    
        async def upload_image(img: UploadFile, contents: bytes) -> str:
            file_path = f"plantas/{user_id}/{timestamp}/imagens/{img.filename}"
            await run_query(lambda: supabase.storage.from_("PlansStoraga").upload(
                path=file_path,
                file=contents,
                file_options={"content-type": img.content_type},
            ))
            return supabase.storage.from_("PlansStoraga").get_public_url(file_path)
        
        image_urls = await asyncio.gather(*[
        upload_image(img, contents)
        for img, contents in zip(imageFiles, image_contents)
    ])
        
        async def upload_project_file(doc: UploadFile, contents: bytes) -> str:
            file_path = f"plantas/{user_id}/{timestamp}/projeto/{doc.filename}"
            await run_query(lambda: supabase.storage.from_("PlansStoraga").upload(
                path=file_path,
                file=contents,
                file_options={"content-type": doc.content_type, "upsert": "true"},
            ))
            return file_path

        project_file_urls = await asyncio.gather(*[
            upload_project_file(doc, contents)
            for doc, contents in zip(projectFiles, project_contents)
        ])

        image_urls = list(image_urls)
        project_file_urls = list(project_file_urls)

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
            "especificacoes":   especificacoes_dict,
        }

        response = await run_query(
            lambda: supabase.table("planta").insert(planta_db).execute()
        )
        
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
    category:     Optional[str]    = None,
    squareFeet:   Optional[str]    = None,
    price:        float            = 0,
    imageFiles:   List[UploadFile] = [],
    projectFiles: List[UploadFile] = [],
):
    try:
        supabase = get_supabase_admin()

       
        planta_atual = await run_query(lambda: (
            supabase.table("planta")
            .select("dono, imagens, plantas_arquivo")
            .eq("id", plant_id)
            .single()
            .execute()
        ))

        if not planta_atual.data:
            raise HTTPException(status_code=404, detail="Planta não encontrada.")

        dono            = planta_atual.data.get("dono")
        imagens_atuais  = planta_atual.data.get("imagens", [])        or []
        arquivos_atuais = planta_atual.data.get("plantas_arquivo", []) or []

        timestamp = datetime.datetime.now().strftime("%d%m%Y_%H%M%S")

        def url_to_path(url: str) -> str:
            return url.split("/PlansStoraga/")[-1]

        # ── IMAGENS ──────────────────────────────────────────────────────
        if imageFiles:
            # Ler todos os ficheiros primeiro
            image_contents = [await img.read() for img in imageFiles]

            # Apagar imagens antigas (não bloqueia o upload das novas)
            old_image_paths = [url_to_path(u) for u in imagens_atuais if u]

            async def delete_old_images():
                if old_image_paths:
                    await run_query(lambda: supabase.storage
                        .from_("PlansStoraga").remove(old_image_paths))

            async def upload_image(img: UploadFile, contents: bytes) -> str:
                file_path = f"plantas/{dono}/{timestamp}/imagens/{img.filename}"
                await run_query(lambda: supabase.storage.from_("PlansStoraga").upload(
                    path=file_path,
                    file=contents,
                    file_options={"content-type": img.content_type},
                ))
                return supabase.storage.from_("PlansStoraga").get_public_url(file_path)

            # Delete das antigas e upload das novas correm ao mesmo tempo
            _, image_urls = await asyncio.gather(
                delete_old_images(),
                asyncio.gather(*[
                    upload_image(img, contents)
                    for img, contents in zip(imageFiles, image_contents)
                ])
            )
            image_urls = list(image_urls)
        else:
            image_urls = imagens_atuais

        # ── FICHEIROS DE PROJETO ────────────────────────────────────────
        if projectFiles:
            project_contents = [await doc.read() for doc in projectFiles]

            async def delete_old_project_files():
                if arquivos_atuais:
                    await run_query(lambda: supabase.storage
                        .from_("PlansStoraga").remove(arquivos_atuais))

            async def upload_project_file(doc: UploadFile, contents: bytes) -> str:
                file_path = f"plantas/{dono}/{timestamp}/projeto/{doc.filename}"
                await run_query(lambda: supabase.storage.from_("PlansStoraga").upload(
                    path=file_path,
                    file=contents,
                    file_options={"content-type": doc.content_type, "upsert": "true"},
                ))
                return file_path

            _, project_file_urls = await asyncio.gather(
                delete_old_project_files(),
                asyncio.gather(*[
                    upload_project_file(doc, contents)
                    for doc, contents in zip(projectFiles, project_contents)
                ])
            )
            project_file_urls = list(project_file_urls)
        else:
            project_file_urls = arquivos_atuais

        # ── UPDATE NA TABELA ────────────────────────────────────────────
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

        response = await run_query(lambda: (
            supabase.table("planta")
            .update(planta_update)
            .eq("id", plant_id)
            .execute()
        ))

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
    def build_query():

        query = (
            supabase.table("vw_compras_usuario")
            .select("*")
            .eq("comprador_id", usuario_id)
        )
        status = "pendente"
        query = query.eq("status", status)
        return query.order("comprado_em", desc=True).execute()
    
    result = await run_query(lambda: build_query())
    print(f"[get_historico_compras] Result:{result.data}\n comprimento {len(result.data)}")
    return {
       "total": len(result.data),
        "compras": result.data,
    }

async def get_download_urlsNotziped(plant_id: str, buyer_user_id: str):
  
    supabase = get_supabase_admin()

    purchase = await run_query(lambda: (
        supabase.table("compra")
        .select("*")
        .eq("planta_id", plant_id)
        .eq("cliente_id", buyer_user_id)
        .eq("status", "pendente")
        .execute()
    ))

    if not purchase.data:
        raise HTTPException(status_code=403, detail="Compra não confirmada para este utilizador.")

    planta = await run_query(lambda: (
        supabase.table("planta")
        .select("planta_arquivos")
        .eq("id", plant_id)
        .single()
        .execute()
    ))

    if not planta.data:
        raise HTTPException(status_code=404, detail="Planta não encontrada.")

    paths = planta.data.get("planta_arquivos")
    
    if not paths:
        raise HTTPException(
            status_code=404,
            detail="Nenhum ficheiro técnico disponível para esta planta.",
        )
    async def make_signed_url(path: str) -> dict:
        result = await run_query(lambda: supabase.storage.from_("PlansStoraga").create_signed_url(
            path=path,
            expires_in=3600,
        ))
        return {
            "filename": path.split("/")[-1],
            "url":      result["signedURL"],
        }
        
    signed_urls = await asyncio.gather(*[make_signed_url(p) for p in paths])

    return {"download_urls": list(signed_urls)}
   

async def get_download_urls(plant_id: str, buyer_user_id: str):
    supabase = get_supabase_admin()

    purchase = await run_query(lambda: (
        supabase.table("compra")
        .select("*")
        .eq("planta_id", plant_id)
        .eq("cliente_id", buyer_user_id)
        .eq("status", "pendente")
        .execute()
    ))

    if not purchase.data:
        raise HTTPException(status_code=403, detail="Compra não confirmada para este utilizador.")

    planta = await run_query(lambda: (
        supabase.table("planta")
        .select("planta_arquivos, nome")
        .eq("id", plant_id)
        .single()
        .execute()
    ))

    if not planta.data:
        raise HTTPException(status_code=404, detail="Planta não encontrada.")

    paths = planta.data.get("planta_arquivos")
    if not paths:
        raise HTTPException(status_code=404, detail="Nenhum ficheiro técnico disponível para esta planta.")

    async def download_file(path: str) -> tuple[str, bytes]:
        content = await run_query(lambda: supabase.storage.from_("PlansStoraga").download(path))
        return path.split("/")[-1], content

    files = await asyncio.gather(*[download_file(p) for p in paths])

   
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for filename, content in files:
            zf.writestr(filename, content)
    zip_buffer.seek(0)

    nome_planta = planta.data.get("nome", "planta").replace(" ", "_")

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={nome_planta}.zip"},
    )


async def SendRP(report, user_id: str):
    supabase = get_supabase_admin()

    Denunciador = await run_query(lambda: (
        supabase.table("usuario")
        .select("nome")
        .eq("id", user_id)
        .single()
        .execute()
    ))

    report_data = {
        "nome":           Denunciador.data["nome"] if Denunciador.data else "Desconhecido",
        "id_planta":      report.get("Denunciado", ""),
        "categoria":      report.get("categoria_denuncia", ""),
        "descricao":      report.get("descricao", ""),
        "data_registro":  report.get("data", ""),
        "estado":         report.get("estado", ""),
    }

    response = await run_query(lambda: (
        supabase.table("denuncia").insert(report_data).execute()
    ))

    return JSONResponse(
        status_code=201,
        content={"message": "Relatório enviado com sucesso!", "data": response.data},
    )