
from models.db import get_supabase_admin
from fastapi.responses import JSONResponse
from fastapi import UploadFile, File


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

async def GetAdminDashboardWithdrawals():
    supabase = get_supabase_admin()
    
    response = (
        supabase.table("Withdrawal_request")
        .select("id, created_at, valor, estado, IBAN, arquiteto_id")
        .execute()
    )

    withdrawals = []
    for item in response.data:
        user = (
            supabase.table("usuario")
            .select("nome")
            .eq("id", item["arquiteto_id"])
            .single()
            .execute()
        )

        withdrawals.append({
            "id": item["id"],
            "architectName": user.data["nome"] if user.data else "Nome não encontrado",
            "architectAvatar": "",
            "iban": item["IBAN"],
            "amount": item["valor"],
            "requestDate": item["created_at"],
            "status": "Paid" if item["estado"] == "paid" else "Pending",
            "proofUrl": None,
        })

    return withdrawals


async def MarcarSaqueComoPago(withdrawal_id: str, comprovativo: UploadFile):
    supabase = get_supabase_admin()

    contents = await comprovativo.read()
    file_path = f"comprovativos/{withdrawal_id}/{comprovativo.filename}"

    supabase.storage.from_("PlansStoraga").upload(
        path=file_path,
        file=contents,
        file_options={"content-type": comprovativo.content_type},
    )

    url = supabase.storage.from_("PlansStoraga").get_public_url(file_path)

    
    withdrawal = supabase.table("Withdrawal_request").select("arquiteto_id").eq("id", withdrawal_id).single().execute()
    arquiteto_id = withdrawal.data["arquiteto_id"]  # ← extrai o valor

  
    supabase.table("Withdrawal_request").update({
        "estado": "paid",
        "comprovativo_url": url,
    }).eq("id", withdrawal_id).execute()

    
    supabase.table("arquiteto").update({
        "saldo_disponivel": 0,
    }).eq("id", arquiteto_id).execute()  # ← usa a string, não o objeto

    return {"mensagem": "Saque marcado como pago", "comprovativo_url": url}