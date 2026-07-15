"""
routes/payments.py
Endpoints do sistema de pagamento Stripe
"""

import stripe
import os
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from models.payment_model import (
    criar_sessao_checkout,
    confirmar_pagamento,
    solicitar_saque,
    solicitar_transferencia,
    aprovar_transferencia,
    listar_compras,
    listar_compras_arquiteto,
    verificar_sessao,
    historico_compras_cliente
)
from middlewares.auth import get_current_user  # reutiliza o teu middleware existente

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

router = APIRouter(tags=["payments"])


# ──────────────────────────────────────────────
# SCHEMAS
# ──────────────────────────────────────────────
class CheckoutBody(BaseModel):
    planta_id: str
    arquiteto_id: str
    nome_planta: str
    preco: float
    imagem_url: str = None


class TransferenciaBody(BaseModel):
    compra_id: str


# ──────────────────────────────────────────────
# POST /api/payments/create-checkout-session
# Cliente inicia compra
# ──────────────────────────────────────────────
@router.post("/create-checkout-session")
async def create_checkout_session(
    body: CheckoutBody,
    user=Depends(get_current_user),
):
    """
    Cria uma sessão Stripe Checkout para o cliente comprar uma planta.
    """
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

    try:
        result = await criar_sessao_checkout(
            planta_id=body.planta_id,
            cliente_id=user["id"],
            arquiteto_id=body.arquiteto_id,
            nome_planta=body.nome_planta,
            preco=body.preco,
            imagem_url=body.imagem_url,
            success_url=f"{frontend_url}/checkout/sucesso",
            cancel_url=f"{frontend_url}/checkout/cancelado",
        )
        return result
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# POST /api/payments/webhook
# Stripe notifica pagamento confirmado
# ──────────────────────────────────────────────
@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
):
    """
    Webhook do Stripe — escuta eventos de pagamento.
    ⚠️ Esta rota NÃO deve ter autenticação JWT (é chamada pelo Stripe).
    """
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Assinatura inválida")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ── Eventos relevantes ──
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") == "paid":
            await confirmar_pagamento(
                session_id=session["id"],
                payment_intent_id=session.get("payment_intent", ""),
            )

    elif event["type"] == "payment_intent.succeeded":
        # Fallback alternativo — normalmente o checkout.session.completed é suficiente
        pass

    return JSONResponse(content={"received": True})


# ──────────────────────────────────────────────
# GET /api/payments/verificar-sessao/{session_id}
# Frontend verifica se pagamento foi bem sucedido
# ──────────────────────────────────────────────
@router.get("/verificar-sessao/{session_id}")
async def verificar_sessao_route(session_id: str, user=Depends(get_current_user)):
    try:
        return await verificar_sessao(session_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ──────────────────────────────────────────────
# POST /api/payments/solicitar-transferencia
# Arquiteto solicita o seu pagamento
# ──────────────────────────────────────────────
@router.post("/solicitar-transferencia")
async def solicitar_transferencia_route(
    body: TransferenciaBody,
    user=Depends(get_current_user),
):
    if user.get("role") not in ("arquiteto", "admin"):
        raise HTTPException(status_code=403, detail="Apenas arquitetos podem solicitar transferências.")

    try:
        data = await solicitar_transferencia(
            compra_id=body.compra_id,
            arquiteto_id=user["id"],
        )
        return {"message": "Transferência solicitada com sucesso.", "compra": data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ──────────────────────────────────────────────
# POST /api/payments/aprovar-transferencia
# Admin aprova e marca como transferido
# ──────────────────────────────────────────────
@router.post("/aprovar-transferencia")
async def aprovar_transferencia_route(
    body: TransferenciaBody,
    user=Depends(get_current_user),
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Apenas o admin pode aprovar transferências.")

    try:
        data = await aprovar_transferencia(compra_id=body.compra_id)
        return {"message": "Transferência aprovada.", "compra": data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ──────────────────────────────────────────────
# GET /api/payments/compras
# Admin lista todas as compras (com filtro opcional por status)
# ──────────────────────────────────────────────
@router.get("/compras")
async def get_compras(status: str = None, user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Apenas o admin pode listar todas as compras.")

    try:
        return await listar_compras(status=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# GET /api/payments/historico
# Qualquer utilizador autenticado vê as suas compras
# ──────────────────────────────────────────────
@router.get("/historico")
async def get_historico_compras(
    status: str = None,
    user=Depends(get_current_user),
):
    try:
        data = await historico_compras_cliente(
            cliente_id=user["id"],
            status=status,
        )
        return {
            "total": len(data),
            "compras": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ──────────────────────────────────────────────
# GET /api/payments/minhas-compras
# Arquiteto vê as compras associadas a ele
# ──────────────────────────────────────────────
@router.get("/minhas-compras")
async def get_minhas_compras(user=Depends(get_current_user)):
    try:
        return await listar_compras_arquiteto(arquiteto_id=user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Made by Petel - 2026-05-24
@router.put("/solicitar-saque")
async def solicitar_saque_route(user: dict = Depends(get_current_user)):
    
        return await solicitar_saque(arquiteto_id=user["id"])





@router.put("/aprovar-saque")
async def aprovar_saque_route(request_id: str, user: dict = Depends(get_current_user)):
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Apenas o admin pode aprovar saques.")
        return await aprovar_transferencia(request_id=request_id)


