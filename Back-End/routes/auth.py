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



class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class ArquitetoUpdateSchema(BaseModel):
    endereco:            Optional[str] = None
    bio:                 Optional[str] = None
    nif:                 Optional[str] = None
    cedula_profissional: Optional[str] = None
    IBAN:                Optional[str] = None



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
    
    try:
        sb.storage.create_bucket("profiles", options={"public": True})
    except Exception:
        pass  

    ext = file.filename.rsplit(".", 1)[-1]
    path = f"arquitetos/{uuid.uuid4()}.{ext}"
    sb.storage.from_("profiles").upload(
        path, content, {"content-type": file.content_type}
    )
    return sb.storage.from_("profiles").get_public_url(path)


# ── Rotas ──────────────────────────────────────────────────────────────────────
class PerfilGeralUpdateSchema(BaseModel):
    nome:     Optional[str] = None
    telefone: Optional[str] = None
 
 
class ArquitetoUpdateSchema(BaseModel):
    endereco:            Optional[str] = None
    bio:                 Optional[str] = None
    nif:                 Optional[str] = None
    cedula_profissional: Optional[str] = None
    IBAN:                Optional[str] = None
    compania:            Optional[str] = None   # ← campo novo
 
 
# ── GET /me  (substitui o existente — agora devolve telefone também) ───────────
@auth_router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    """
    Devolve dados básicos do utilizador autenticado.
    Busca foto_pessoal na tabela certa (arquiteto ou cliente).
    """
    sb = get_supabase_admin()
    role = user.get("role", "cliente")
 
    try:
        u_row = (
            sb.table("usuario")
            .select("nome, email, telefone")
            .eq("id", user["id"])
            .single()
            .execute()
        )
        telefone = u_row.data.get("telefone") if u_row.data else None
    except Exception:
        telefone = None
 
    foto_pessoal = None
    try:
        tabela = "arquiteto" if role == "arquiteto" else "cliente"
        f_row = (
            sb.table(tabela)
            .select("foto_pessoal")
            .eq("id", user["id"])
            .single()
            .execute()
        )
        foto_pessoal = f_row.data.get("foto_pessoal") if f_row.data else None
    except Exception:
        pass
 
    return {
        "id":          user["id"],
        "email":       user["email"],
        "role":        role,
        "nome":        user.get("nome", user["email"]),
        "telefone":    telefone,
        "foto_pessoal": foto_pessoal,
    }
 
 
# ── POST /me/foto  — faz upload e grava URL na tabela certa ───────────────────
 
@auth_router.post("/me/foto", status_code=200)
async def upload_foto(
    foto: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """
    Recebe um ficheiro de imagem, faz upload para o bucket 'profiles'
    e guarda a URL pública em arquiteto.foto_pessoal ou cliente.foto_pessoal
    conforme o role do utilizador autenticado.
    """
    sb   = get_supabase_admin()
    role = user.get("role", "cliente")
 
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if foto.content_type not in allowed:
        raise HTTPException(
            status_code=422,
            detail="Tipo de ficheiro inválido. Use JPG, PNG ou WEBP."
        )
 
    content = await foto.read()
 
    # Limita a 5 MB
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Ficheiro demasiado grande. Máximo 5 MB.")
 
    try:
        sb.storage.create_bucket("profiles", options={"public": True})
    except Exception:
        pass  # já existe
 
    ext  = (foto.filename or "foto").rsplit(".", 1)[-1].lower()
    path = f"{role}/{user['id']}/foto.{ext}"
 
    try:
        sb.storage.from_("profiles").remove([path])
    except Exception:
        pass
 
    # Upload
    try:
        sb.storage.from_("profiles").upload(
            path, content, {"content-type": foto.content_type, "upsert": "true"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no upload: {e}")
 
    foto_url = sb.storage.from_("profiles").get_public_url(path)
 
    # Persiste URL na tabela correcta
    tabela = "arquiteto" if role == "arquiteto" else "cliente"
    try:
        sb.table(tabela).update({"foto_pessoal": foto_url}).eq("id", user["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload feito mas erro ao guardar URL: {e}")
 
    return {"foto_url": foto_url}
 
 
# ── DELETE /me/foto  — remove a foto de perfil ────────────────────────────────
 
@auth_router.delete("/me/foto", status_code=200)
async def delete_foto(user: dict = Depends(get_current_user)):
    """
    Remove a foto de perfil do utilizador: apaga do storage e limpa a coluna.
    """
    sb   = get_supabase_admin()
    role = user.get("role", "cliente")
 
    # Tenta remover as variantes possíveis do ficheiro
    for ext in ("jpg", "jpeg", "png", "webp"):
        try:
            sb.storage.from_("profiles").remove([f"{role}/{user['id']}/foto.{ext}"])
        except Exception:
            pass
 
    tabela = "arquiteto" if role == "arquiteto" else "cliente"
    try:
        sb.table(tabela).update({"foto_pessoal": None}).eq("id", user["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao remover foto: {e}")
 
    return {"message": "Foto removida com sucesso."}
 
 
# ── PUT /me  (novo — salva nome e telefone na tabela usuario) ──────────────────
 
@auth_router.put("/me")
async def update_me(
    data: PerfilGeralUpdateSchema,
    user: dict = Depends(get_current_user),
):
    sb = get_supabase_admin()
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
 
    if not payload:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar.")
 
    try:
        sb.table("usuario").update(payload).eq("id", user["id"]).execute()
 
        # Sincroniza o nome nos metadados do Supabase Auth (opcional mas útil)
        if "nome" in payload:
            sb.auth.admin.update_user_by_id(
                user["id"],
                {"user_metadata": {"nome": payload["nome"]}}
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar perfil: {e}")
 
    return {"message": "Perfil atualizado com sucesso."}
 
 
# ── GET /me/arquiteto ──────────────────────────────────────────────────────────
 
@auth_router.get("/me/arquiteto")
async def me_arquiteto(user: dict = Depends(get_current_user)):
    if user.get("role") != "arquiteto":
        raise HTTPException(status_code=403, detail="Acesso restrito a arquitectos.")
 
    sb = get_supabase_admin()
    try:
        res = (
            sb.table("arquiteto")
            .select(
                "endereco, foto_pessoal, cedula_profissional, bio, nif, "
                "avaliacao, saldo_disponivel, IBAN, compania"
            )
            .eq("id", user["id"])
            .single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Perfil profissional não encontrado: {e}")
 
    return res.data
 
 
# ── PUT /me/arquiteto ──────────────────────────────────────────────────────────
 
@auth_router.put("/me/arquiteto")
async def update_me_arquiteto(
    data: ArquitetoUpdateSchema,
    user: dict = Depends(get_current_user),
):
    if user.get("role") != "arquiteto":
        raise HTTPException(status_code=403, detail="Acesso restrito a arquitectos.")
 
    sb = get_supabase_admin()
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
 
    if not payload:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar.")
 
    if "IBAN" in payload:
        payload["IBAN"] = payload["IBAN"].replace(" ", "").upper()
 
    try:
        sb.table("arquiteto").update(payload).eq("id", user["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar perfil: {e}")
 
    return {"message": "Perfil profissional atualizado com sucesso."}

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
    user: dict = Depends(get_current_user)   
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

    iban_str = iban.replace(" ", "").upper() if iban else None

    try:
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