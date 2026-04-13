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


async def create(data: UserCreateSchema):
    sb = get_supabase_admin()

    name     = data.name.strip()
    email    = data.email.strip()
    password = data.password
    role     = data.role.strip()

    try:
        auth_res = sb.auth.admin.create_user({
            'email':         email,
            'password':      password,
            'email_confirm': True,
            'user_metadata': {'nome': name, 'tipo_id': role}
        })
        user_id = auth_res.user.id
        return {'id': user_id, 'name': name, 'email': email, 'role': role}

    except Exception as e:
        err = str(e)
        if 'already registered' in err or 'duplicate' in err.lower():
            raise HTTPException(status_code=409, detail='Este email já está registado.')
        raise HTTPException(status_code=500, detail=err)


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