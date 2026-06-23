"""
models/carrinho_model.py  — v3 (compatível com supabase-py 1.x e 2.x)

Correcções:
  - Substituído .maybe_single() por .limit(1) + verificação manual
    (.maybe_single() não existe em versões antigas do supabase-py)
  - Logs de erro no helper _obter_ou_criar_carrinho para facilitar debug
"""

import asyncio
from fastapi import HTTPException
from models.db import get_supabase_admin
from models.payment_model import criar_sessao_checkout

supabase = get_supabase_admin()


# ──────────────────────────────────────────────
#  HELPER: garante que o carrinho existe
# ──────────────────────────────────────────────
def _obter_ou_criar_carrinho(usuario_id: str) -> dict:
    """
    Devolve o carrinho do utilizador.
    Cria um novo carrinho caso ainda não exista.
    Usa .limit(1) em vez de .maybe_single() para compatibilidade
    com todas as versões do supabase-py.
    """
    try:
        res = (
            supabase.table("carrinho")
            .select("id, usuario_id, criado_em, atualizado_em")
            .eq("usuario_id", usuario_id)
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao consultar carrinho: {str(e)}"
        )

    # Carrinho já existe
    if res.data and len(res.data) > 0:
        return res.data[0]

    # Criar novo carrinho
    try:
        novo = (
            supabase.table("carrinho")
            .insert({"usuario_id": usuario_id})
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar carrinho: {str(e)}"
        )

    if not novo.data or len(novo.data) == 0:
        raise HTTPException(
            status_code=500,
            detail="Falha ao criar carrinho: resposta vazia do Supabase."
        )

    return novo.data[0]


# ──────────────────────────────────────────────
#  1. ADICIONAR ITEM
# ──────────────────────────────────────────────
async def adicionar_item(usuario_id: str, planta_id: str) -> dict:
    """Adiciona uma planta ao carrinho. Idempotente (ignora duplicados)."""

    # Verificar que a planta existe
    try:
        planta_res = (
            supabase.table("planta")
            .select("id, nome, orcamento, dono, imagens")
            .eq("id", planta_id)
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar planta: {str(e)}")

    if not planta_res.data or len(planta_res.data) == 0:
        raise HTTPException(status_code=404, detail="Planta não encontrada.")

    planta = planta_res.data[0]

    # Bloquear o dono de comprar a sua própria planta
    if planta["dono"] == usuario_id:
        raise HTTPException(
            status_code=400,
            detail="Não pode adicionar a sua própria planta ao carrinho.",
        )

    carrinho = _obter_ou_criar_carrinho(usuario_id)

    # Verificar se já existe antes de inserir (evita depender de upsert)
    try:
        existente = (
            supabase.table("carrinho_item")
            .select("id")
            .eq("carrinho_id", carrinho["id"])
            .eq("planta_id", planta_id)
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar item: {str(e)}")

    if existente.data and len(existente.data) > 0:
        return {"mensagem": "Planta já está no carrinho.", "planta": planta}

    try:
        supabase.table("carrinho_item").insert({
            "carrinho_id": carrinho["id"],
            "planta_id": planta_id,
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao inserir item: {str(e)}")

    return {"mensagem": "Planta adicionada ao carrinho.", "planta": planta}


# ──────────────────────────────────────────────
#  2. REMOVER ITEM
# ──────────────────────────────────────────────
async def remover_item(usuario_id: str, planta_id: str) -> dict:
    """Remove uma planta específica do carrinho."""
    carrinho = _obter_ou_criar_carrinho(usuario_id)

    try:
        deleted = (
            supabase.table("carrinho_item")
            .delete()
            .eq("carrinho_id", carrinho["id"])
            .eq("planta_id", planta_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao remover item: {str(e)}")

    if not deleted.data:
        raise HTTPException(status_code=404, detail="Item não encontrado no carrinho.")

    return {"mensagem": "Item removido do carrinho."}


# ──────────────────────────────────────────────
#  3. LISTAR CARRINHO
# ──────────────────────────────────────────────
async def listar_carrinho(usuario_id: str) -> dict:
    """
    Devolve todos os itens com detalhes da planta e nome do arquiteto.
    Usa queries separadas (padrão do projecto) — Supabase não suporta
    joins encadeados sobre a mesma tabela estrangeira.
    """
    carrinho = _obter_ou_criar_carrinho(usuario_id)

    # Query 1: itens + join simples com planta
    try:
        itens_res = (
            supabase.table("carrinho_item")
            .select("id, adicionado_em, planta_id, planta(id, nome, descricao, orcamento, imagens, dono)")
            .eq("carrinho_id", carrinho["id"])
            .order("adicionado_em", desc=False)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar itens: {str(e)}")

    itens = itens_res.data or []

    if not itens:
        return {
            "carrinho_id": carrinho["id"],
            "total_itens": 0,
            "valor_total": 0.0,
            "itens": [],
        }

    # Query 2: nomes dos arquitetos (campo "dono" na planta)
    arquiteto_ids = list({
        item["planta"]["dono"]
        for item in itens
        if item.get("planta") and item["planta"].get("dono")
    })

    arquitetos = {}
    if arquiteto_ids:
        try:
            arq_res = (
                supabase.table("usuario")
                .select("id, nome")
                .in_("id", arquiteto_ids)
                .execute()
            )
            arquitetos = {u["id"]: u for u in (arq_res.data or [])}
        except Exception as e:
            # Não fatal — carrinho ainda funciona sem o nome
            arquitetos = {}

    # Enriquecer com o nome do arquiteto
    for item in itens:
        if item.get("planta"):
            dono_id = item["planta"].get("dono")
            item["planta"]["arquiteto"] = arquitetos.get(dono_id, {})

    total = sum(
        (item["planta"]["orcamento"] or 0)
        for item in itens
        if item.get("planta")
    )

    return {
        "carrinho_id": carrinho["id"],
        "total_itens": len(itens),
        "valor_total": round(total, 2),
        "itens": itens,
    }


# ──────────────────────────────────────────────
#  4. LIMPAR CARRINHO
# ──────────────────────────────────────────────
async def limpar_carrinho(usuario_id: str) -> dict:
    """Remove todos os itens sem apagar o carrinho."""
    carrinho = _obter_ou_criar_carrinho(usuario_id)

    try:
        supabase.table("carrinho_item").delete().eq(
            "carrinho_id", carrinho["id"]
        ).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao limpar carrinho: {str(e)}")

    return {"mensagem": "Carrinho limpo com sucesso."}


# ──────────────────────────────────────────────
#  HELPER: itens para checkout
# ──────────────────────────────────────────────
def _itens_para_checkout(carrinho_id: str) -> list[dict]:
    try:
        res = (
            supabase.table("carrinho_item")
            .select("planta_id, planta(id, nome, orcamento, imagens, dono)")
            .eq("carrinho_id", carrinho_id)
            .execute()
        )
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar itens: {str(e)}")


# ──────────────────────────────────────────────
#  5. COMPRAR ITEM INDIVIDUAL
# ──────────────────────────────────────────────
async def comprar_item(
    usuario_id: str,
    planta_id: str,
    success_url: str,
    cancel_url: str,
) -> dict:
    carrinho = _obter_ou_criar_carrinho(usuario_id)
    itens = _itens_para_checkout(carrinho["id"])

    item = next((i for i in itens if i["planta_id"] == planta_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Planta não encontrada no carrinho.")

    planta = item["planta"]
    preco = planta.get("orcamento") or 0
    if preco <= 0:
        raise HTTPException(status_code=400, detail="Esta planta não tem preço definido.")

    imagem_url = (planta.get("imagens") or [None])[0]

    try:
        resultado = await asyncio.wait_for(
            criar_sessao_checkout(
                planta_id=planta["id"],
                cliente_id=usuario_id,
                arquiteto_id=planta["dono"],
                nome_planta=planta["nome"],
                preco=preco,
                imagem_url=imagem_url,
                success_url=success_url,
                cancel_url=cancel_url,
            ),
            timeout=15.0,  # 15 segundos — evita loading infinito
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Timeout ao criar sessão Stripe. Verifica a STRIPE_SECRET_KEY no .env.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro Stripe: {str(e)}")

    return resultado


# ──────────────────────────────────────────────
#  6. COMPRAR TUDO
# ──────────────────────────────────────────────
async def comprar_tudo(
    usuario_id: str,
    success_url: str,
    cancel_url: str,
) -> dict:
    carrinho = _obter_ou_criar_carrinho(usuario_id)
    itens = _itens_para_checkout(carrinho["id"])

    if not itens:
        raise HTTPException(status_code=400, detail="O carrinho está vazio.")

    itens_validos = [
        i for i in itens
        if i.get("planta") and (i["planta"].get("orcamento") or 0) > 0
    ]
    if not itens_validos:
        raise HTTPException(
            status_code=400,
            detail="Nenhuma planta no carrinho tem preço definido.",
        )

    async def _checkout_item(item: dict) -> dict:
        planta = item["planta"]
        imagem_url = (planta.get("imagens") or [None])[0]
        return await criar_sessao_checkout(
            planta_id=planta["id"],
            cliente_id=usuario_id,
            arquiteto_id=planta["dono"],
            nome_planta=planta["nome"],
            preco=planta["orcamento"],
            imagem_url=imagem_url,
            success_url=success_url,
            cancel_url=cancel_url,
        )

    sessoes = await asyncio.gather(*[_checkout_item(i) for i in itens_validos])

    return {
        "total_sessoes": len(sessoes),
        "valor_total": round(
            sum(i["planta"]["orcamento"] for i in itens_validos), 2
        ),
        "sessoes": list(sessoes),
    }