from fastapi import APIRouter, Depends , UploadFile, File
from models.admin_model import AdminCarregarPlantas, AdminCarregarDenuncia , AdminDelPlant , AdminFinalizarDenuncia, AdminAlluser , BanUser, GetAdminDashboard , SuspenderUser , GetAdminDashboardWithdrawals , MarcarSaqueComoPago
from middlewares.auth import get_current_user
admin_router = APIRouter(tags=["admin"])

@admin_router.get("/")
async def LoadGeral():
    
    return await GetAdminDashboard()

@admin_router.get("/dashboard")
async def LoadPlants(user = Depends(get_current_user)):

    return await AdminCarregarPlantas()

@admin_router.get("/withdrawals")
async def LoadWithdrawals(user = Depends(get_current_user)):
    return await GetAdminDashboardWithdrawals()

@admin_router.put("/withdrawals/{withdrawal_id}/pagar")
async def PagarWithdrawal(
    withdrawal_id: str,
    comprovativo: UploadFile = File(...),
    user=Depends(get_current_user)
):
    return await MarcarSaqueComoPago(withdrawal_id, comprovativo)


@admin_router.delete("/dashboard/{plant_id}")
async def AdminDelPlant(Plant_id:str , user = Depends(get_current_user)):
    return await AdminDelPlant(Plant_id)



@admin_router.get("/denuncias")
async def LoadDenuncias():

    return await AdminCarregarDenuncia()


@admin_router.put("/denuncias")
async def FinalizarDenuncias(denuncia_id:str , user = Depends(get_current_user)):

    return await AdminFinalizarDenuncia(denuncia_id)

@admin_router.get("/users")
async def LoadUsers():
    return await AdminAlluser()

@admin_router.put("/users/ban/{user_id}")
async def BanirUser(user_id:str ):
    
    return await BanUser(user_id)

@admin_router.put("/users/suspend/{user_id}")
async def SuspendUser(user_id:str ):
    
    return await SuspenderUser(user_id)


