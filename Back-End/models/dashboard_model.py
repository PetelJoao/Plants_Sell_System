import datetime
from fastapi import  UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from models.db import get_supabase_admin




async def all_plants():
    supabase = get_supabase_admin()
    response = (
        supabase.table("planta")
        .select("*")
        .execute()
    )
    return response.data 

async def DeletePlants(plant_id:str):
    supabase = get_supabase_admin()
    response = supabase.table("planta").eq("dono",plant_id).execute()

async def upload_plants(
    user_id:str,
    title: str = Form(...),
    description: str = Form(None),
    squareFeet: str = Form(None),
    price: float = Form(0),
    file: UploadFile = File(...),
    
):

    try:
        supabase = get_supabase_admin()
        timestamp = datetime.datetime.now().strftime("%d%m%Y_%S")
        contents = await file.read()
        file_path = f"plantas/{user_id}/{timestamp}_{file.filename}"

        
        storage = supabase.storage.from_("PlansStoraga").upload(
            path=file_path,
            file=contents,
            file_options={"content-type": file.content_type}
        )
    
        # Gerar URL pública
        file_url = supabase.storage.from_("PlansStoraga").get_public_url(file_path)

        # Preparar dados para o Banco de Dados
        planta_db = {
            "nome": title,           
            "descricao": description, 
            "dimensao": squareFeet,   
            "dono": user_id,
            "orcamento": price,
            "imagens": [file_url],               
            "plantas_arquivo": file_url         
        }

        # Inserir na tabela
        response = supabase.table("planta").insert(planta_db).execute()

        return JSONResponse(
            status_code=201,
            content={
                "message": "Planta Cadastrada com sucesso !!",
                "data": response.data
            }
        )

    except Exception as e:
       
        raise HTTPException(status_code=500, detail=str(e))