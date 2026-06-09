"""
routes/carrinho_route.py
Endpoints do carrinho de compras.

Prefixo sugerido em app.py:  /api/carrinho
"""

import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from models.carrinho_model import (
    adicionar_item,
    remover_item,
    listar_carrinho,
    limpar_carrinho,
    comprar_item,
    comprar_tudo,
)
from middlewares.auth import get_current_user

router = APIRouter(tags=["carrinho"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ──────────────────────────────────────────────
#  SCHEMAS
# ──────────────────────────────────────────────
class AdicionarItemBody(BaseModel):
    planta_id: str


class ComprarItemBody(BaseModel):
    planta_id: str
    success_url: str = ""
    cancel_url: str = ""


class ComprarTudoBody(BaseModel):
    success_url: str = ""
    cancel_url: str = ""


# ──────────────────────────────────────────────
#  GET /api/carrinho
#  Lista todos os itens do carrinho do utilizador
# ──────────────────────────────────────────────
@router.get("/")
async def get_carrinho(user=Depends(get_current_user)):
    """Devolve o carrinho completo com detalhes de cada planta."""
    try:
        return await listar_carrinho(usuario_id=user["id"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
#  POST /api/carrinho/adicionar
#  Adiciona uma planta ao carrinho
# ──────────────────────────────────────────────
@router.post("/adicionar")
async def post_adicionar_item(
    body: AdicionarItemBody,
    user=Depends(get_current_user),
):
    """
    Adiciona a planta indicada ao carrinho do utilizador autenticado.
    Ignora silenciosamente se a planta já estiver no carrinho (idempotente).
    """
    try:
        return await adicionar_item(
            usuario_id=user["id"],
            planta_id=body.planta_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
#  DELETE /api/carrinho/remover/{planta_id}
#  Remove uma planta específica do carrinho
# ──────────────────────────────────────────────
@router.delete("/remover/{planta_id}")
async def delete_remover_item(
    planta_id: str,
    user=Depends(get_current_user),
):
    """Remove um único item do carrinho pelo ID da planta."""
    try:
        return await remover_item(
            usuario_id=user["id"],
            planta_id=planta_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
#  DELETE /api/carrinho/limpar
#  Esvazia o carrinho (mantém o registo do carrinho)
# ──────────────────────────────────────────────
@router.delete("/limpar")
async def delete_limpar_carrinho(user=Depends(get_current_user)):
    """Remove todos os itens do carrinho sem apagá-lo."""
    try:
        return await limpar_carrinho(usuario_id=user["id"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
#  POST /api/carrinho/comprar-item
#  Checkout de uma única planta
# ──────────────────────────────────────────────
@router.post("/comprar-item")
async def post_comprar_item(
    body: ComprarItemBody,
    user=Depends(get_current_user),
):
    """
    Inicia uma sessão Stripe para comprar apenas uma planta do carrinho.
    Devolve { checkout_url, session_id }.
    """
    success_url = body.success_url or f"{FRONTEND_URL}/checkout/sucesso"
    cancel_url  = body.cancel_url  or f"{FRONTEND_URL}/checkout/cancelado"

    try:
        return await comprar_item(
            usuario_id=user["id"],
            planta_id=body.planta_id,
            success_url=success_url,
            cancel_url=cancel_url,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
#  POST /api/carrinho/comprar-tudo
#  Checkout de todos os itens do carrinho
# ──────────────────────────────────────────────
@router.post("/comprar-tudo")
async def post_comprar_tudo(
    body: ComprarTudoBody,
    user=Depends(get_current_user),
):
    """
    Cria uma sessão Stripe por cada item do carrinho e devolve todas elas.
    O frontend deve redirecionar o utilizador para cada checkout_url em sequência
    (ou abrir num modal/tab separado).

    Resposta:
    {
      "total_sessoes": 3,
      "valor_total": 450.00,
      "sessoes": [
        { "checkout_url": "https://checkout.stripe.com/...", "session_id": "cs_..." },
        ...
      ]
    }
    """
    success_url = body.success_url or f"{FRONTEND_URL}/checkout/sucesso"
    cancel_url  = body.cancel_url  or f"{FRONTEND_URL}/checkout/cancelado"

    try:
        return await comprar_tudo(
            usuario_id=user["id"],
            success_url=success_url,
            cancel_url=cancel_url,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))