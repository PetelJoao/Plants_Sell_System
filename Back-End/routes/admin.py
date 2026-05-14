from fastapi import APIRouter, Depends
from models.admin_model import AdminCarregarPlantas, AdminCarregarDenuncia , AdminDelPlant , AdminFinalizarDenuncia
from middlewares.auth import get_current_user
admin_router = APIRouter(tags=["admin"])

@admin_router.get("/dashboard")
async def LoadPlants(user = Depends(get_current_user)):

    return await AdminCarregarPlantas()


@admin_router.delete("/dashboard/{plant_id}")
async def AdminDelPlant(Plant_id:str , user = Depends(get_current_user)):
    return await AdminDelPlant(Plant_id)



@admin_router.get("/denuncias")
async def LoadDenuncias():

    return await AdminCarregarDenuncia()


@admin_router.put("/denuncias")
async def FinalizarDenuncias(denuncia_id:str , user = Depends(get_current_user)):

    return await AdminFinalizarDenuncia(denuncia_id)