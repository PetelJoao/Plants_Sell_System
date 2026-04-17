from fastapi import APIRouter , Depends , UploadFile , File , Form
from middlewares.auth import get_current_user
from models.dashboard_model import all_plants , upload_plants , DeletePlants
dashboard_router =  APIRouter(tags=["dashboard"])

@dashboard_router.get("/")
async def LoadDashboard(user = Depends(get_current_user)):

    return await  all_plants()

@dashboard_router.post("/{user_id}")
async def SavePlants(
                    user_id: str,
                    title: str = Form(...),
                    description: str = Form(None),
                    squareFeet: str = Form(None),
                    price: float = Form(0),
                    file: UploadFile = File(...),
                    user = Depends(get_current_user)
                    ):
    
    return await upload_plants(
        user_id=user_id, 
        title=title, 
        description=description, 
        squareFeet=squareFeet, 
        price=price, 
        file=file
    )

@dashboard_router.post("DeletarPlanta/{Plant_id}")
async def DeletarPlanta(Plant_id:str,user = Depends(get_current_user)):

    return DeletePlants(Plant_id)
    