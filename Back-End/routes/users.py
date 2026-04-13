from fastapi import APIRouter, Depends
from middlewares.auth import get_current_user
from controllers.users_controllers import (
    get_all, get_by_id, create, update, remove,
    UserCreateSchema, UserUpdateSchema
)

users_router = APIRouter(tags=["users"])

@users_router.get("/")
async def route_get_all(user=Depends(get_current_user)):
    return await get_all()

@users_router.get("/{user_id}")
async def route_get_by_id(user_id: str, user=Depends(get_current_user)):
    return await get_by_id(user_id)

@users_router.post("/", status_code=201)
async def route_create(data: UserCreateSchema, user=Depends(get_current_user)):
    return await create(data)

@users_router.put("/{user_id}")
async def route_update(user_id: str, data: UserUpdateSchema, user=Depends(get_current_user)):
    return await update(user_id, data)

@users_router.delete("/{user_id}")
async def route_remove(user_id: str, user=Depends(get_current_user)):
    return await remove(user_id)