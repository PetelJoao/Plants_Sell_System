"""
routes/carrinho_route.py
Endpoints do carrinho de compras.

Prefixo sugerido em app.py:  /api/carrinho
"""
import traceback
from fastapi import APIRouter, Depends, HTTPException
from middlewares.auth import get_current_user
from models.db import get_supabase_admin
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


class AdicionarItemBody(BaseModel):
    planta_id: str


class ComprarItemBody(BaseModel):
    planta_id: str
    success_url: str = ""
    cancel_url: str = ""


class ComprarTudoBody(BaseModel):
    success_url: str = ""
    cancel_url: str = ""

@router.get("/")
async def get_carrinho(user=Depends(get_current_user)):
    """Devolve o carrinho completo com detalhes de cada planta."""
    try:
        return await listar_carrinho(usuario_id=user["id"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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

@router.delete("/limpar")
async def delete_limpar_carrinho(user=Depends(get_current_user)):
    """Remove todos os itens do carrinho sem apagá-lo."""
    try:
        return await limpar_carrinho(usuario_id=user["id"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    
@router.get("/debug")
async def debug_carrinho(user=Depends(get_current_user)):

     supabase = get_supabase_admin()
     resultado = {}

     # Passo 1: consegue listar carrinho?
     try:
         r = supabase.table("carrinho").select("*").eq("usuario_id", user["id"]).limit(1).execute()
         resultado["passo1_select_carrinho"] = "OK"
         resultado["carrinho_encontrado"] = bool(r.data)
     except Exception as e:
         resultado["passo1_select_carrinho"] = f"ERRO: {str(e)}"
         resultado["traceback"] = traceback.format_exc()
         return resultado

     if not r.data:
         try:
             ins = supabase.table("carrinho").insert({"usuario_id": user["id"]}).execute()
             resultado["passo2_insert_carrinho"] = "OK"
             resultado["carrinho_criado"] = ins.data
         except Exception as e:
             resultado["passo2_insert_carrinho"] = f"ERRO: {str(e)}"
             resultado["traceback"] = traceback.format_exc()
             return resultado
     else:
         resultado["passo2_insert_carrinho"] = "PULADO (já existe)"

     try:
         carrinho_id = (r.data or resultado.get("carrinho_criado", [{}]))[0].get("id")
         r2 = supabase.table("carrinho_item").select("id").eq("carrinho_id", carrinho_id).limit(1).execute()
         resultado["passo3_select_itens"] = "OK"
         resultado["itens_count"] = len(r2.data or [])
     except Exception as e:
        import traceback
        traceback.print_exc()   # ← imprime stack completo no terminal
        raise HTTPException(status_code=500, detail=str(e))

        return resultado