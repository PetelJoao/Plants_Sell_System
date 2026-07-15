# routes/comments_route.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from middlewares.auth import get_current_user
from models.comment_model import (
    criar_comentario,
    listar_comentarios,
    deletar_comentario,
    verificar_compra,
)

comments_router = APIRouter(tags=["comments"])


class CommentBody(BaseModel):
    conteudo: str = Field(..., min_length=3, max_length=1000)


# ──────────────────────────────────────────────
# GET /api/comments/{planta_id}
# Público — qualquer um pode ver os comentários
# ──────────────────────────────────────────────
@comments_router.get("/{planta_id}")
async def get_comentarios(planta_id: str):
    return await listar_comentarios(planta_id)


# ──────────────────────────────────────────────
# GET /api/comments/{planta_id}/pode-comentar
# Verifica se o utilizador autenticado comprou a planta
# ──────────────────────────────────────────────
@comments_router.get("/{planta_id}/pode-comentar")
async def pode_comentar(planta_id: str, user=Depends(get_current_user)):
    comprou = await verificar_compra(planta_id, user["id"])
    return {"pode_comentar": comprou}


# ──────────────────────────────────────────────
# POST /api/comments/{planta_id}
# Cria comentário — apenas compradores verificados
# ──────────────────────────────────────────────
@comments_router.post("/{planta_id}")
async def post_comentario(
    planta_id: str,
    body: CommentBody,
    user=Depends(get_current_user),
):
    return await criar_comentario(
        planta_id=planta_id,
        autor_id=user["id"],
        conteudo=body.conteudo,
    )


# ──────────────────────────────────────────────
# DELETE /api/comments/{comment_id}
# Autor ou admin podem apagar
# ──────────────────────────────────────────────
@comments_router.delete("/{comment_id}")
async def delete_comentario(comment_id: str, user=Depends(get_current_user)):
    return await deletar_comentario(
        comment_id=comment_id,
        autor_id=user["id"],
        is_admin=(user.get("role") == "admin"),
    )