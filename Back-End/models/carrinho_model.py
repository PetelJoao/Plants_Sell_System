"""
models/carrinho_model.py
Lógica de negócio do carrinho de compras.

Fluxo:
  1. Utilizador adiciona plantas ao carrinho  → carrinho + carrinho_item
  2. Compra individual  → checkout de 1 item
  3. Compra tudo        → checkout de todos os itens em paralelo
  4. Remove item        → apaga carrinho_item
  5. Limpa carrinho     → apaga todos os carrinho_item

Depende de:
  - models.db.get_supabase_admin
  - models.payment_model.criar_sessao_checkout   (reutilizado)
"""

from fastapi import HTTPException
from models.db import get_supabase_admin
from models.payment_model import criar_sessao_checkout

supabase = get_supabase_admin()


# ──────────────────────────────────────────────
#  HELPER: garante que o carrinho existe
# ──────────────────────────────────────────────
def _obter_ou_criar_carrinho(usuario_id: str) -> dict:
    """Devolve o carrinho do utilizador, criando-o se não existir."""
    res = (
        supabase.table("carrinho")
        .select("*")
        .eq("usuario_id", usuario_id)
        .maybe_single()
        .execute()
    )
    if res.data:
        return res.data

    novo = (
        supabase.table("carrinho")
        .insert({"usuario_id": usuario_id})
        .execute()
    )
    return novo.data[0]


# ──────────────────────────────────────────────
#  1. ADICIONAR ITEM
# ──────────────────────────────────────────────
async def adicionar_item(usuario_id: str, planta_id: str) -> dict:
    """Adiciona uma planta ao carrinho do utilizador (ignora duplicados)."""

    # Verificar que a planta existe
    planta_res = (
        supabase.table("planta")
        .select("id, nome, orcamento, dono, imagens")
        .eq("id", planta_id)
        .maybe_single()
        .execute()
    )
    if not planta_res.data:
        raise HTTPException(status_code=404, detail="Planta não encontrada.")

    planta = planta_res.data

    # Não deixar o dono comprar a própria planta
    if planta["dono"] == usuario_id:
        raise HTTPException(
            status_code=400, detail="Não pode adicionar a sua própria planta ao carrinho."
        )

    carrinho = _obter_ou_criar_carrinho(usuario_id)

    # Upsert: constraint UNIQUE (carrinho_id, planta_id) impede duplicados
    supabase.table("carrinho_item").upsert(
        {"carrinho_id": carrinho["id"], "planta_id": planta_id},
        on_conflict="carrinho_id,planta_id",
    ).execute()

    return {"mensagem": "Planta adicionada ao carrinho.", "planta": planta}


# ──────────────────────────────────────────────
#  2. REMOVER ITEM
# ──────────────────────────────────────────────
async def remover_item(usuario_id: str, planta_id: str) -> dict:
    """Remove uma planta específica do carrinho."""
    carrinho = _obter_ou_criar_carrinho(usuario_id)

    deleted = (
        supabase.table("carrinho_item")
        .delete()
        .eq("carrinho_id", carrinho["id"])
        .eq("planta_id", planta_id)
        .execute()
    )

    if not deleted.data:
        raise HTTPException(status_code=404, detail="Item não encontrado no carrinho.")

    return {"mensagem": "Item removido do carrinho."}


# ──────────────────────────────────────────────
#  3. LISTAR CARRINHO
# ──────────────────────────────────────────────
async def listar_carrinho(usuario_id: str) -> dict:
    """Devolve todos os itens do carrinho com detalhes da planta."""
    carrinho = _obter_ou_criar_carrinho(usuario_id)

    itens_res = (
        supabase.table("carrinho_item")
        .select("id, adicionado_em, planta(id, nome, descricao, orcamento, imagens, dono, arquiteto:dono(id, usuario:id(nome)))")
        .eq("carrinho_id", carrinho["id"])
        .order("adicionado_em", desc=False)
        .execute()
    )

    itens = itens_res.data or []
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
#  4. LIMPAR CARRINHO  (todos os itens)
# ──────────────────────────────────────────────
async def limpar_carrinho(usuario_id: str) -> dict:
    """Remove todos os itens do carrinho sem apagar o carrinho em si."""
    carrinho = _obter_ou_criar_carrinho(usuario_id)

    supabase.table("carrinho_item").delete().eq(
        "carrinho_id", carrinho["id"]
    ).execute()

    return {"mensagem": "Carrinho limpo com sucesso."}


# ──────────────────────────────────────────────
#  HELPER INTERNO: busca itens prontos para checkout
# ──────────────────────────────────────────────
def _itens_para_checkout(carrinho_id: str) -> list[dict]:
    res = (
        supabase.table("carrinho_item")
        .select("planta_id, planta(id, nome, orcamento, imagens, dono)")
        .eq("carrinho_id", carrinho_id)
        .execute()
    )
    return res.data or []


# ──────────────────────────────────────────────
#  5. COMPRAR ITEM INDIVIDUAL
# ──────────────────────────────────────────────
async def comprar_item(
    usuario_id: str,
    planta_id: str,
    success_url: str,
    cancel_url: str,
) -> dict:
    """Inicia checkout Stripe para uma única planta do carrinho."""
    carrinho = _obter_ou_criar_carrinho(usuario_id)
    itens = _itens_para_checkout(carrinho["id"])

    item = next((i for i in itens if i["planta_id"] == planta_id), None)
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Planta não encontrada no carrinho.",
        )

    planta = item["planta"]
    preco = planta.get("orcamento") or 0
    if preco <= 0:
        raise HTTPException(status_code=400, detail="Esta planta não tem preço definido.")

    imagem_url = (planta.get("imagens") or [None])[0]

    resultado = await criar_sessao_checkout(
        planta_id=planta["id"],
        cliente_id=usuario_id,
        arquiteto_id=planta["dono"],
        nome_planta=planta["nome"],
        preco=preco,
        imagem_url=imagem_url,
        success_url=success_url,
        cancel_url=cancel_url,
    )

    return resultado


# ──────────────────────────────────────────────
#  6. COMPRAR TUDO
# ──────────────────────────────────────────────
async def comprar_tudo(
    usuario_id: str,
    success_url: str,
    cancel_url: str,
) -> dict:
    """
    Cria uma sessão Stripe separada por cada item do carrinho
    (Stripe não suporta múltiplos vendedores numa só sessão).
    Devolve a lista de sessões para o frontend redirecionar uma a uma.
    """
    import asyncio

    carrinho = _obter_ou_criar_carrinho(usuario_id)
    itens = _itens_para_checkout(carrinho["id"])

    if not itens:
        raise HTTPException(status_code=400, detail="O carrinho está vazio.")

    # Filtrar plantas sem preço
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
        "sessoes": sessoes,   # [{checkout_url, session_id}, ...]
    }