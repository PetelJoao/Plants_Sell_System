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
    response = supabase.table("planta").delete().eq("id", plant_id).execute()
    return JSONResponse(status_code=200, content={"message": "Planta deletada", "data": response.data})


async def upload_plants(
    user_id: str,
    title: str,
    description:        Optional[str]         = None,
    topology:           Optional[str]         = None,
    category:           Optional[str]         = None,
    squareFeet:         Optional[str]         = None,
    bedrooms:           Optional[int]         = 0,
    bathrooms:          Optional[int]         = 0,
    price:              float                 = 0,
    # Pasta de imagens públicas (galeria/capa)
    imageFiles:         List[UploadFile]      = File(default=[]),
    # Pasta de documentos técnicos (PDF, ZIP, etc.)
    projectFiles:       List[UploadFile]      = File(default=[]),
):
    print("=" * 60)
    print("DEBUG upload_plants chamado")
    print(f"  user_id:      {user_id}")
    print(f"  title:        {title}")
    print(f"  description:  {description}")
    print(f"  topology:     {topology}")
    print(f"  category:     {category}")
    print(f"  squareFeet:   {squareFeet}")
    print(f"  bedrooms:     {bedrooms}")
    print(f"  bathrooms:    {bathrooms}")
    print(f"  price:        {price}")
    print(f"  imageFiles:   {[f.filename for f in imageFiles]}")
    print(f"  projectFiles: {[f.filename for f in projectFiles]}")
    print("=" * 60)

    if not imageFiles or len(imageFiles) == 0:
        raise HTTPException(status_code=422, detail="Nenhuma imagem pública enviada.")

    if not projectFiles or len(projectFiles) == 0:
        raise HTTPException(status_code=422, detail="Nenhum arquivo de projeto enviado.")

    try:
        supabase = get_supabase_admin()
        timestamp = datetime.datetime.now().strftime("%d%m%Y_%H%M%S")

        # ── 1. Upload das imagens públicas (galeria) ──────────────────────────
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
            print(f"DEBUG imagem carregada: {url}")

        # ── 2. Upload dos arquivos técnicos do projeto ────────────────────────
        project_file_urls: List[str] = []

        for doc in projectFiles:
            contents  = await doc.read()
            file_path = f"plantas/{user_id}/{timestamp}/projeto/{doc.filename}"

            supabase.storage.from_("PlansStoraga").upload(
                path=file_path,
                file=contents,
                file_options={"content-type": doc.content_type},
            )

            # URLs dos documentos técnicos NÃO são públicas — guardamos o path
            # para gerar URLs assinadas (temporárias) no momento da compra
            project_file_urls.append(file_path)
            print(f"DEBUG documento técnico carregado: {file_path}")

        # ── 3. Inserir na tabela ──────────────────────────────────────────────
        planta_db = {
            "nome":            title,
            "descricao":       description,
            "tipologia":       topology,
            "categoria":       category,
            "dimensao":        squareFeet,
            "quartos":         bedrooms,
            "casas_de_banho":  bathrooms,
            "dono":            user_id,
            "orcamento":       price,
            # Lista de URLs públicas para exibição na galeria
            "imagens":         image_urls,
            # Lista de paths privados para download após compra
            "plantas_arquivo": project_file_urls,
        }

        print(f"DEBUG: a inserir na tabela: {planta_db}")
        response = supabase.table("planta").insert(planta_db).execute()
        print(f"DEBUG: insert resultado = {response.data}")

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


# ── Endpoint para download após compra ───────────────────────────────────────
async def get_download_urls(plant_id: str, buyer_user_id: str):
    """
    Gera URLs assinadas (válidas por 1 hora) apenas para compradores confirmados.
    Chame este endpoint depois de verificar a compra no teu sistema de pagamentos.
    """
    supabase = get_supabase_admin()

    # 1. Verificar se a compra existe e está confirmada
    purchase = supabase.table("compra") \
        .select("*") \
        .eq("planta_id", plant_id) \
        .eq("comprador_id", buyer_user_id) \
        .eq("status", "confirmado") \
        .execute()

    if not purchase.data:
        raise HTTPException(status_code=403, detail="Compra não confirmada para este utilizador.")

    # 2. Buscar os paths dos arquivos técnicos da planta
    planta = supabase.table("planta") \
        .select("plantas_arquivo") \
        .eq("id", plant_id) \
        .single() \
        .execute()

    if not planta.data:
        raise HTTPException(status_code=404, detail="Planta não encontrada.")

    paths: List[str] = planta.data["plantas_arquivo"]

    # 3. Gerar URLs assinadas com expiração de 1 hora (3600 segundos)
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