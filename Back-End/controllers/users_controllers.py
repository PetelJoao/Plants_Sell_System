from fastapi import HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from models.db import get_supabase_admin

class UserCreateSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = ""

class UserUpdateSchema(BaseModel):
    name:  Optional[str] = None
    email: Optional[str] = None
    role:  Optional[str] = None


async def get_all():
    sb  = get_supabase_admin()
    res = sb.table('usuarios').select('id, nome, email, tipo_id, criado_em').execute()
    return res.data


async def get_by_id(user_id: str):
    sb  = get_supabase_admin()
    res = sb.table('usuarios').select('id, nome, email, tipo_id, criado_em').eq('id', user_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')
    return res.data

async def update(user_id: str, data: UserUpdateSchema):
    sb = get_supabase_admin()
    sb.table('usuarios').update({
        'nome':    data.name,
        'email':   data.email,
        'tipo_id': data.role
    }).eq('id', user_id).execute()
    return {'message': 'Usuário atualizado'}


async def remove(user_id: str):
    sb = get_supabase_admin()
    sb.auth.admin.delete_user(user_id)
    return {'message': 'Usuário removido'}