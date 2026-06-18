"""
models/payment_model.py  (versão corrigida)
Estrutura real:
  - arquiteto(id, endereco, foto_pessoal, cedula_profissional, bio, nif, avaliacao)
  - cliente(id, data_registro)
  - usuario(id, nome, ...)   ← tem o nome/email
  - compra(id, planta_id, cliente_id, arquiteto_id, valor, status, ...)
  O id de arquiteto/cliente é o mesmo que usuario.id (auth.uid())

CORRECÇÕES:
  - stripe.checkout.Session.create é síncrono — executado via
    asyncio.get_event_loop().run_in_executor para não bloquear o event loop
  - Mesmo fix aplicado a stripe.checkout.Session.retrieve
  - Adicionado timeout e mensagens de erro claras
"""

import asyncio
from functools import partial

from fastapi import HTTPException
import stripe
import os
from models.db import get_supabase_admin

supabase = get_supabase_admin()


# ──────────────────────────────────────────────
#  HELPER: correr função síncrona do Stripe sem bloquear o event loop
# ──────────────────────────────────────────────
async def _run_stripe(fn, *args, **kwargs):
    """
    Executa uma chamada síncrona do Stripe SDK numa thread separada,
    evitando que bloqueie o event loop do FastAPI (causa de loading infinito).
    """
    loop = asyncio.get_event_loop()
    try:
        return await asyncio.wait_for(
            loop.run_in_executor(None, partial(fn, *args, **kwargs)),
            timeout=15.0,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Timeout na chamada ao Stripe. Verifica a STRIPE_SECRET_KEY no .env.",
        )
    except stripe.error.AuthenticationError:
        raise HTTPException(
            status_code=500,
            detail="Chave Stripe inválida. Verifica STRIPE_SECRET_KEY no ficheiro .env.",
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Erro Stripe: {str(e)}")


# ──────────────────────────────────────────────
#  CRIAR SESSÃO CHECKOUT
# ──────────────────────────────────────────────
async def criar_sessao_checkout(
    planta_id: str,
    cliente_id: str,
    arquiteto_id: str,
    nome_planta: str,
    preco: float,
    imagem_url: str = None,
    success_url: str = "",
    cancel_url: str = "",
):
    session_params = {
        "payment_method_types": ["card"],
        "mode": "payment",
        "line_items": [
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": int(preco * 100),
                    "product_data": {
                        "name": nome_planta,
                    },
                },
                "quantity": 1,
            }
        ],
        "success_url": success_url + "?session_id={CHECKOUT_SESSION_ID}",
        "cancel_url": cancel_url,
        "metadata": {
            "planta_id":    planta_id,
            "cliente_id":   cliente_id,
            "arquiteto_id": arquiteto_id,
        },
    }

    # Chamada síncrona do Stripe executada em thread separada
    session = await _run_stripe(stripe.checkout.Session.create, **session_params)

    supabase.table("compra").insert({
        "planta_id":         planta_id,
        "cliente_id":        cliente_id,
        "arquiteto_id":      arquiteto_id,
        "valor":             preco,
        "status":            "pendente",
        "stripe_session_id": session.id,
    }).execute()

    return {"checkout_url": session.url, "session_id": session.id}


# ──────────────────────────────────────────────
#  CONFIRMAR PAGAMENTO
# ──────────────────────────────────────────────
async def confirmar_pagamento(session_id: str, payment_intent_id: str):
    result = (
        supabase.table("compra")
        .update({
            "status": "pago",
            "stripe_payment_intent_id": payment_intent_id,
        })
        .eq("stripe_session_id", session_id)
        .execute()
    )
    return result.data


# ──────────────────────────────────────────────
#  ARQUITETO SOLICITA TRANSFERÊNCIA
# ──────────────────────────────────────────────
async def solicitar_transferencia(compra_id: str, arquiteto_id: str):
    compra = (
        supabase.table("compra")
        .select("*")
        .eq("id", compra_id)
        .eq("arquiteto_id", arquiteto_id)
        .limit(1)
        .execute()
    )

    if not compra.data:
        raise HTTPException(
            status_code=404,
            detail="Compra não encontrada ou não pertence ao arquiteto.",
        )

    if compra.data[0]["status"] != "pago":
        raise HTTPException(
            status_code=400,
            detail=f"Estado actual: '{compra.data[0]['status']}'. Só pode solicitar após pagamento confirmado.",
        )

    result = (
        supabase.table("compra")
        .update({"status": "solicitado"})
        .eq("id", compra_id)
        .execute()
    )
    return result.data


# ──────────────────────────────────────────────
#  ADMIN APROVA TRANSFERÊNCIA
# ──────────────────────────────────────────────
async def aprovar_transferencia(compra_id: str):
    compra = (
        supabase.table("compra")
        .select("*")
        .eq("id", compra_id)
        .limit(1)
        .execute()
    )

    if not compra.data:
        raise HTTPException(status_code=404, detail="Compra não encontrada.")

    if compra.data[0]["status"] != "solicitado":
        raise HTTPException(
            status_code=400,
            detail="A compra precisa estar no estado 'solicitado'.",
        )

    result = (
        supabase.table("compra")
        .update({
            "status": "transferido",
            "notas":  "Transferência aprovada pelo administrador.",
        })
        .eq("id", compra_id)
        .execute()
    )
    return result.data


# ──────────────────────────────────────────────
#  LISTAR COMPRAS (admin)
# ──────────────────────────────────────────────
async def listar_compras(status: str = None):
    query = (
        supabase.table("compra")
        .select("*, planta(nome, orcamento, imagens)")
        .order("created_at", desc=True)
    )
    if status:
        query = query.eq("status", status)

    compras = query.execute().data or []
    if not compras:
        return []

    todos_ids = list({
        uid
        for c in compras
        for uid in [c.get("cliente_id"), c.get("arquiteto_id")]
        if uid
    })

    usuarios = {}
    if todos_ids:
        res = (
            supabase.table("usuario")
            .select("id, nome, email")
            .in_("id", todos_ids)
            .execute()
        )
        usuarios = {u["id"]: u for u in (res.data or [])}

    for c in compras:
        c["cliente"]   = usuarios.get(c.get("cliente_id"),   {})
        c["arquiteto"] = usuarios.get(c.get("arquiteto_id"), {})

    return compras


# ──────────────────────────────────────────────
#  HISTÓRICO DE COMPRAS DO CLIENTE
# ──────────────────────────────────────────────
async def historico_compras_cliente(cliente_id: str, status: str = None):
    query = (
        supabase.table("compra")
        .select("*, planta(id, nome, orcamento, imagens)")
        .eq("cliente_id", cliente_id)
        .order("created_at", desc=True)
    )
    if status:
        query = query.eq("status", status)

    result = query.execute()
    return result.data or []


# ──────────────────────────────────────────────
#  LISTAR COMPRAS DO ARQUITETO
# ──────────────────────────────────────────────
async def listar_compras_arquiteto(arquiteto_id: str):
    compras = (
        supabase.table("compra")
        .select("*, planta(nome, orcamento, imagens)")
        .eq("arquiteto_id", arquiteto_id)
        .order("created_at", desc=True)
        .execute()
    ).data or []

    if not compras:
        return []

    cliente_ids = list({c["cliente_id"] for c in compras if c.get("cliente_id")})
    usuarios = {}
    if cliente_ids:
        res = (
            supabase.table("usuario")
            .select("id, nome, email")
            .in_("id", cliente_ids)
            .execute()
        )
        usuarios = {u["id"]: u for u in (res.data or [])}

    for c in compras:
        c["cliente"] = usuarios.get(c.get("cliente_id"), {})

    return compras


# ──────────────────────────────────────────────
#  VERIFICAR SESSÃO STRIPE
# ──────────────────────────────────────────────
async def verificar_sessao(session_id: str):
    session = await _run_stripe(stripe.checkout.Session.retrieve, session_id)

    compra_res = (
        supabase.table("compra")
        .select("*, planta(nome, imagens)")
        .eq("stripe_session_id", session_id)
        .limit(1)
        .execute()
    )

    return {
        "stripe_status": session.payment_status,
        "compra":        compra_res.data[0] if compra_res.data else None,
    }


# ──────────────────────────────────────────────
#  SOLICITAR SAQUE
# ──────────────────────────────────────────────
async def solicitar_saque(arquiteto_id: str):
    arq = (
        supabase.table("arquiteto")
        .select("saldo_disponivel, IBAN")
        .eq("id", arquiteto_id)
        .limit(1)
        .execute()
    )

    if not arq.data:
        raise HTTPException(status_code=404, detail="Arquiteto não encontrado.")

    saldo = arq.data[0]["saldo_disponivel"]
    iban  = arq.data[0]["IBAN"]

    if saldo <= 0:
        raise HTTPException(status_code=400, detail="Sem saldo para sacar.")

    pedido_existente = (
        supabase.table("Withdrawal_request")
        .select("id")
        .eq("arquiteto_id", arquiteto_id)
        .eq("estado", "pending")
        .limit(1)
        .execute()
    )

    if pedido_existente.data:
        raise HTTPException(status_code=400, detail="Já existe um pedido de saque pendente.")

    supabase.table("Withdrawal_request").insert({
        "arquiteto_id": arquiteto_id,
        "valor":  saldo,
        "estado": "pending",
        "IBAN":   iban,
    }).execute()

    return {"mensagem": "Pedido de saque criado, aguarda aprovação.", "valor": saldo}