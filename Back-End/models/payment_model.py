"""
models/payment_model.py  (versão corrigida)
Estrutura real:
  - arquiteto(id, endereco, foto_pessoal, cedula_profissional, bio, nif, avaliacao)
  - cliente(id, data_registro)
  - usuario(id, nome, ...)   ← tem o nome/email
  - compra(id, planta_id, cliente_id, arquiteto_id, valor, status, ...)
  O id de arquiteto/cliente é o mesmo que usuario.id (auth.uid())
"""

from fastapi import HTTPException
import stripe
import os
from models.db import get_supabase_admin

supabase = get_supabase_admin()
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
                        #**({"images": [imagem_url]} if imagem_url else {}),
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

    session = stripe.checkout.Session.create(**session_params)

    supabase.table("compra").insert({
        "planta_id":         planta_id,
        "cliente_id":        cliente_id,
        "arquiteto_id":      arquiteto_id,
        "valor":             preco,
        "status":            "pendente",
        "stripe_session_id": session.id,
    }).execute()

    return {"checkout_url": session.url, "session_id": session.id}



# CONFIRMAR PAGAMENTO 
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



# ARQUITECTO SOLICITA TRANSFECIA
async def solicitar_transferencia(compra_id: str, arquiteto_id: str):
    compra = (
        supabase.table("compra")
        .select("*")
        .eq("id", compra_id)
        .eq("arquiteto_id", arquiteto_id)
        .single()
        .execute()
    )

    if not compra.data:
        raise Exception("Compra não encontrada ou não pertence ao arquiteto.")

    if compra.data["status"] != "pago":
        raise Exception(
            f"Estado actual: '{compra.data['status']}'. Só pode solicitar após pagamento confirmado."
        )

    result = (
        supabase.table("compra")
        .update({"status": "solicitado"})
        .eq("id", compra_id)
        .execute()
    )
    return result.data


# ADMIN APROVA TRANSFERÊNCIA
async def aprovar_transferencia(compra_id: str):
    compra = (
        supabase.table("compra")
        .select("*")
        .eq("id", compra_id)
        .single()
        .execute()
    )

    if  not compra.data:
        raise Exception("Compra não encontrada.")

    if compra.data["status"] != "solicitado":
        raise Exception("A compra precisa estar no estado 'solicitado'.")

    result = (
        supabase.table("compra")
        .update({
            "status": "transferido",
            "notas":  "Transferência aprovada pelo administrador (modo teste).",
        })
        .eq("id", compra_id)
        .execute()
    )
    return result.data

async def listar_compras(status: str = None):
    """
    Supabase não suporta dois joins para a mesma tabela estrangeira.
    Solução: buscar compras + planta, depois enriquecer com usuario
    numa segunda query usando os IDs de cliente e arquiteto.
    """
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

    # Colectar IDs únicos
    todos_ids = list({
        uid
        for c in compras
        for uid in [c.get("cliente_id"), c.get("arquiteto_id")]
        if uid
    })

    # Uma query para todos os utilizadores envolvidos
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


async def verificar_sessao(session_id: str):
    session = stripe.checkout.Session.retrieve(session_id)

    compra_res = (
        supabase.table("compra")
        .select("*, planta(nome, imagens)")
        .eq("stripe_session_id", session_id)
        .single()
        .execute()
    )

    return {
        "stripe_status": session.payment_status,
        "compra":        compra_res.data,
    }

async def solicitar_saque(arquiteto_id: str):
    Arquiteto_id = arquiteto_id

  
    arq = (
        supabase.table("arquiteto")
        .select("saldo_disponivel","IBAN")
        .eq("id", Arquiteto_id)
        .single()
        .execute()
    )

    saldo = arq.data["saldo_disponivel"]
    iban = arq.data["IBAN"]
    if saldo <= 0:
        raise HTTPException(status_code=400, detail="Sem saldo para sacar")

  
    pedido_existente = (
        supabase.table("Withdrawal_request")
        .select("id")
        .eq("arquiteto_id", Arquiteto_id)
        .eq("estado", "pending")
        .execute()
    )

    if pedido_existente.data:
        raise HTTPException(status_code=400, detail="Já existe um pedido de saque pendente")

    #
    supabase.table("Withdrawal_request").insert({
        "arquiteto_id": Arquiteto_id,
        "valor": saldo,
        "estado": "pending",
        "IBAN": iban,
    }).execute()

    return {"mensagem": "Pedido de saque criado, aguarda aprovação", "valor": saldo}

