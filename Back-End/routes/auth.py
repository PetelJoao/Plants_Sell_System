from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from pydantic import BaseModel, EmailStr
from typing import Optional
import traceback
import uuid
import os
from models.db import get_supabase_admin
from middlewares.auth import get_current_user
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

auth_router = APIRouter(tags=["auth"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class LoginSchema(BaseModel):
    email: EmailStr
    password: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _create_auth_user(sb, email: str, password: str, metadata: dict) -> str:
    """Cria utilizador no Supabase Auth e devolve o user_id."""
    try:
        res = sb.auth.admin.create_user({
            "email":         email,
            "password":      password,
            "email_confirm": True,
            "user_metadata": metadata,
        })
        return res.user.id
    except Exception as e:
        err = str(e)
        traceback.print_exc()
        if "already registered" in err or "duplicate" in err.lower():
            raise HTTPException(status_code=409, detail="Este email já está registado.")
        raise HTTPException(status_code=500, detail=err)


def _upload_photo(sb, file: UploadFile, content: bytes) -> str | None:
    if not file or not file.filename:
        return None
    
    # ✅ Cria o bucket se não existir
    try:
        sb.storage.create_bucket("profiles", options={"public": True})
    except Exception:
        pass  # já existe, ignorar

    ext = file.filename.rsplit(".", 1)[-1]
    path = f"arquitetos/{uuid.uuid4()}.{ext}"
    sb.storage.from_("profiles").upload(
        path, content, {"content-type": file.content_type}
    )
    return sb.storage.from_("profiles").get_public_url(path)


# ── Rotas ──────────────────────────────────────────────────────────────────────

@auth_router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "id":    user["id"],
        "email": user["email"],
        "role":  user["role"],
        "nome":  user.get("nome", user["email"]),
    }

@auth_router.post("/forgot-password", status_code=200)
async def forgot_password(email: str = Form(...)):
    sb = get_supabase_admin()
    
    try:
        print(f"[1] A gerar link para: {email}")
        
        response = sb.auth.admin.generate_link({
            "type": "recovery",
            "email": email,
            "options": {
                "redirect_to": f"{os.getenv('SITE_URL')}/Develop/Atualizar-Senha"
            }
        })
        
        print(f"[2] Resposta do Supabase: {response}")
        
        action_link = response.properties.action_link
        print(f"[3] Link gerado: {action_link}")

        gmail_user     = os.getenv("GMAIL_USER")
        gmail_password = os.getenv("GMAIL_APP_PASS")
        
        print(f"[4] Gmail user: {gmail_user}")
        print(f"[5] App pass definida: {bool(gmail_password)}")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Redefinir a sua senha — Duria"
        msg["From"]    = f"Duria Plantas <{gmail_user}>"
        msg["To"]      = email
        msg.attach(MIMEText(f'<a href="{action_link}">Redefinir senha</a>', "html"))

        print(f"[6] A conectar ao Gmail SMTP...")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            print(f"[7] A fazer login...")
            server.login(gmail_user, gmail_password)
            print(f"[8] A enviar e-mail...")
            server.sendmail(gmail_user, email, msg.as_string())
            print(f"[9] E-mail enviado com sucesso!")

    except Exception as e:
        print(f"[ERRO DETALHADO] {type(e).__name__}: {e}")

    return {"message": "Se o e-mail existir, um link foi enviado."}



@auth_router.post("/reset-password", status_code=200)
async def reset_password(
    new_password: str = Form(...),
    user: dict = Depends(get_current_user)   # token de recovery já válido
):
    """
    Atualiza a senha do utilizador autenticado pelo token de recovery.
    """
    sb = get_supabase_admin()
    try:
        sb.auth.admin.update_user_by_id(
            user["id"],
            {"password": new_password}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao redefinir senha: {str(e)}")
    return {"message": "Senha atualizada com sucesso."}

@auth_router.post("/register/cliente", status_code=201)
async def register_cliente(
    name:        str           = Form(...),
    email:       str           = Form(...),
    password:    str           = Form(...),
    phoneNumber: Optional[str] = Form(None),
    gender:      Optional[str] = Form(None),
):
    sb = get_supabase_admin()
    user_id = _create_auth_user(sb, email, password, {
        "nome":     name,
        "tipo":     "cliente",
        "telefone": phoneNumber,
        "sexo":     gender,
    })
    return {"id": user_id, "name": name, "email": email, "role": "cliente"}


@auth_router.post("/register/arquiteto", status_code=201)
async def register_arquiteto(
    name:               str                    = Form(...),
    email:              str                    = Form(...),
    password:           str                    = Form(...),
    phoneNumber:        Optional[str]          = Form(None),
    gender:             Optional[str]          = Form(None),
    address:            Optional[str]          = Form(None),
    nif:                Optional[str]          = Form(None),
    professionalLicense: Optional[str]         = Form(None),
    iban:               Optional[str]          = Form(None),
    biography:          Optional[str]          = Form(None),
    profilePhoto:       Optional[UploadFile]   = File(None),
):
    sb = get_supabase_admin()

    photo_url = None
    if profilePhoto and profilePhoto.filename:
        content = await profilePhoto.read()
        photo_url = _upload_photo(sb, profilePhoto, content)

    user_id = _create_auth_user(sb, email, password, {
        "nome":     name,
        "tipo":     "arquiteto",
        "telefone": phoneNumber,
        "sexo":     gender,
    })

    # ✅ FIX 1: Guardar IBAN como string, não como int
    iban_str = iban.replace(" ", "").upper() if iban else None

    try:
        # ✅ FIX 2: upsert em vez de update — garante que a linha existe
        sb.table("arquiteto").upsert({
            "id":                 user_id,   # ← chave primária
            "endereco":           address,
            "bio":                biography,
            "nif":                nif,
            "cedula_profissional": professionalLicense,
            "IBAN":               iban_str,  # ← string em vez de int
            "foto_pessoal":       photo_url,
        }).execute()
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Conta criada mas erro ao guardar perfil: {e}"
        )

    return {"id": user_id, "name": name, "email": email, "role": "arquiteto"}


@auth_router.post("/login")
async def login(data: LoginSchema):
    sb = get_supabase_admin()
    try:
        res = sb.auth.sign_in_with_password({
            "email":    data.email,
            "password": data.password,
        })
        return {
            "token": res.session.access_token,
            "user":  {"id": res.user.id, "email": res.user.email},
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")