from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import traceback

from models.db import get_supabase_admin
from middlewares.auth import get_current_user

auth_router = APIRouter(tags=["auth"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = ""

class LoginSchema(BaseModel):
    email: EmailStr
    password: str


# ── Rotas ──────────────────────────────────────────────────────────────────────

@auth_router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "id":    user["id"],
        "email": user["email"],
        "role":  user["role"],
        "nome":  user.get("nome", user["email"])
    }


@auth_router.post("/register", status_code=201)
async def register(data: RegisterSchema):
    sb = get_supabase_admin()

    try:
        auth_res = sb.auth.admin.create_user({
            "email":         data.email,
            "password":      data.password,
            "email_confirm": True,
            "user_metadata": {"nome": data.name, "tipo": data.role}
        })
        user_id = auth_res.user.id
        return {"id": user_id, "name": data.name, "email": data.email, "role": data.role}

    except Exception as e:
        err = str(e)
        traceback.print_exc()
        if "already registered" in err or "duplicate" in err.lower():
            raise HTTPException(status_code=409, detail="Este email já está registado.")
        raise HTTPException(status_code=500, detail=err)


@auth_router.post("/login")
async def login(data: LoginSchema):
    sb = get_supabase_admin()

    try:
        res = sb.auth.sign_in_with_password({
            "email":    data.email,
            "password": data.password
        })
        return {
            "token": res.session.access_token,
            "user":  {"id": res.user.id, "email": res.user.email}
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")