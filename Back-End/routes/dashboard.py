from fastapi import APIRouter , Depends , UploadFile , File , Form
from middlewares.auth import get_current_user
from models.dashboard_model import all_plants , upload_plants , DeletePlants , ManagePlants , MyPlants
from typing import List
dashboard_router =  APIRouter(tags=["dashboard"])

@dashboard_router.get("/")
async def LoadDashboard(user = Depends(get_current_user)):

    return await  all_plants()

@dashboard_router.get("/manage")
async def LoadManagePlants(user: dict = Depends(get_current_user)):
  
    return await ManagePlants(user)

@dashboard_router.get("/myplants")
async def LoadMyPlants(user: dict = Depends(get_current_user)):
    return await MyPlants(user)



@dashboard_router.post("/{user_id}")
async def SavePlants(
    user_id:     str,
    title:       str           = Form(...),
    description: str           = Form(None),
    topology:    str           = Form(None),
    category:    str           = Form(None),
    squareFeet:  str           = Form(None),
    bedrooms:    int           = Form(0),
    bathrooms:   int           = Form(0),
    price:       float         = Form(0),
    projectFiles: List[UploadFile] = File(...),   
    imageFiles:   List[UploadFile] = File(...),  
    user=Depends(get_current_user),
):
    return await upload_plants(
        user_id=user_id,
        title=title,
        description=description,
        topology=topology,
        category=category,
        squareFeet=squareFeet,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        price=price,
        projectFiles=projectFiles, 
        imageFiles=imageFiles,     
    )


@dashboard_router.delete("/{Plant_id}")
async def DeletarPlanta(Plant_id:str,user = Depends(get_current_user)):

    return await DeletePlants(Plant_id)
    