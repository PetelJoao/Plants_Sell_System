import datetime
import traceback
from fastapi import UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
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
    description: str = None,
    squareFeet: str = None,
    price: float = 0,
    file: UploadFile = None,
):
    
    print("=" * 60)
    print("DEBUG upload_plants chamado")
    print(f"  user_id:     {user_id}")
    print(f"  title:       {title}")
    print(f"  description: {description}")
    print(f"  squareFeet:  {squareFeet}")
    print(f"  price:       {price}")
    print(f"  file:        {file.filename if file else 'NENHUM'}")
    print(f"  content_type:{file.content_type if file else 'N/A'}")
    print("=" * 60)


    try:
        supabase = get_supabase_admin()
        print("DEBUG: cliente supabase criado ")

        timestamp = datetime.datetime.now().strftime("%d%m%Y_%S")
        contents  = await file.read()
        file_path = f"plantas/{user_id}/{timestamp}_{file.filename}"
        print(f"DEBUG: file_path = {file_path}")

        print("DEBUG: a fazer upload para o storage...")
        storage = supabase.storage.from_("PlansStoraga").upload(   
            path=file_path,
            file=contents,
            file_options={"content-type": file.content_type},
        )
        print(f"DEBUG: upload storage resultado = {storage}")

        file_url = supabase.storage.from_("PlansStoraga").get_public_url(file_path)
        print(f"DEBUG: file_url = {file_url}")

        planta_db = {
            "nome":            title,
            "descricao":       description,
            "dimensao":        squareFeet,
            "dono":            user_id,
            "orcamento":       price,
            "imagens":         [file_url],
            "plantas_arquivo": file_url,
        }
        print(f"DEBUG: a inserir na tabela: {planta_db}")

        response = supabase.table("planta").insert(planta_db).execute()
        print(f"DEBUG: insert resultado = {response.data}")

        return JSONResponse(
            status_code=201,
            content={"message": "Planta cadastrada com sucesso!", "data": response.data},
        )

    except Exception as e:
        print("=" * 60)
        print(" ERRO em upload_plants:")
        traceback.print_exc()        
        print("=" * 60)
        raise HTTPException(status_code=500, detail=str(e))