
from models.db import get_supabase_admin
from fastapi.responses import JSONResponse



async def AdminDelPlant(Plant_id:str):
    ID_plant = Plant_id
    supabase = get_supabase_admin()

    Search_PlantId = (
    supabase.table("compra")
    .select("planta_id")
    .eq("planta_id",ID_plant)
    .execute() 
    )
    SearchedID = Search_PlantId.data

    if SearchedID == ID_plant :
        
        response = (
            supabase.table("planta")
            .update({"estado":"oculto"})
            .eq("id",ID_plant)
            .execute()
        )
        
        return JSONResponse(status_code=200, content={"message":"planta removida da dashboard com sucesso!","data":response.data})
    
    response = (
        supabase.table("planta")
        .delete()
        .eq("id",ID_plant)
        .execute()
    )
    return  JSONResponse(status_code=200 , content={"message":"planta eliminada da dasboard com sucesso !", "data":response.data})


async def AdminFinalizarDenuncia(denuncia_id:str):
    id_denuncia = denuncia_id
    supabase = get_supabase_admin()
    
    response = (
        supabase.table("denuncia")
        .update({"estado":"resolvido"})
        .eq("id",id_denuncia)
        .execute()
    )
    return  JSONResponse(status_code=200 , content={"message":"Estado da denuncia atualizado para resolvido! ", "data":response.data})

async def AdminCarregarDenuncia():
    supabase = get_supabase_admin()
    response = supabase.table("denuncia").select("*").execute()
    return response.data


async def AdminCarregarPlantas():
    supabase = get_supabase_admin()
    response = supabase.table("planta").select("*").execute()
    return response.data

async def AdminAlluser():
    supabase = get_supabase_admin()
    response = supabase.table("usuario").select("id","nome","email","tipo","estado").execute()
    return response.data

async def BanUser(user_id:str):
    id_user = user_id
    supabase = get_supabase_admin()
    
    response = (
        supabase.table("usuario")
        .update({"estado":"banned"})
        .eq("id",id_user)
        .execute()
    )
    return  JSONResponse(status_code=200 , content={"message":"Usuário banido com sucesso! ", "data":response.data})

async def SuspenderUser(user_id:str):
    id_user = user_id
    supabase = get_supabase_admin()
    
    response = (
        supabase.table("usuario")
        .update({"estado":"suspended"})
        .eq("id",id_user)
        .execute()
    )
    return  JSONResponse(status_code=200 , content={"message":"Usuário suspenso com sucesso! ", "data":response.data})

async def GetAdminDashboard():
    supabase = get_supabase_admin()
    response = (
        supabase.from_("dashboard_admin")
        .select("*")
        .single()
        .execute()
    )
    return response.data