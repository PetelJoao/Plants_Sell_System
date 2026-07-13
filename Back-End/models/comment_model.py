# models/comment_model.py
from fastapi import HTTPException
from models.db import get_supabase_admin


# comment_model.py — verificar_compra (temporário para debug)
async def verificar_compra(planta_id: str, cliente_id: str) -> bool:
    supabase = get_supabase_admin()
    
    # DEBUG: mostra o que existe para este cliente
    todas = (
        supabase.table("compra")
        .select("id, planta_id, cliente_id, status")
        .eq("cliente_id", cliente_id)
        .execute()
    )
    print(f"[DEBUG] Compras do cliente {cliente_id}: {todas.data}")
    
    res = (
        supabase.table("compra")
        .select("id")
        .eq("planta_id", planta_id)
        .eq("cliente_id", cliente_id)
        .in_("status", ["pago", "transferido", "pendente"])  # temporário
        .limit(1)
        .execute()
    )
    print(f"[DEBUG] Compra encontrada para planta {planta_id}: {res.data}")
    return bool(res.data)


async def criar_comentario(planta_id: str, autor_id: str, conteudo: str) -> dict:
    """Cria um comentário público numa planta (só para compradores verificados)."""
    supabase = get_supabase_admin()

    # Confirma compra antes de inserir
    comprou = await verificar_compra(planta_id, autor_id)
    if not comprou:
        raise HTTPException(
            status_code=403,
            detail="Apenas quem comprou esta planta pode comentar.",
        )

    # Busca nome do autor
    user_res = (
        supabase.table("usuario")
        .select("nome")
        .eq("id", autor_id)
        .single()
        .execute()
    )
    nome_autor = user_res.data.get("nome", "Anónimo") if user_res.data else "Anónimo"

    res = supabase.table("plant_comments").insert({
        "planta_id":  planta_id,
        "autor_id":   autor_id,
        "nome_autor": nome_autor,
        "conteudo":   conteudo,
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Erro ao guardar comentário.")

    return res.data[0]


async def listar_comentarios(planta_id: str) -> list:
    """Devolve todos os comentários aprovados de uma planta, do mais recente ao mais antigo."""
    supabase = get_supabase_admin()
    res = (
        supabase.table("plant_comments")
        .select("*")
        .eq("planta_id", planta_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


async def deletar_comentario(comment_id: str, autor_id: str, is_admin: bool) -> dict:
    """
    Apaga um comentário.
    - O próprio autor pode apagar o seu comentário.
    - Um admin pode apagar qualquer comentário.
    """
    supabase = get_supabase_admin()

    # Confirma existência
    existing = (
        supabase.table("plant_comments")
        .select("id, autor_id")
        .eq("id", comment_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Comentário não encontrado.")

    if not is_admin and existing.data[0]["autor_id"] != autor_id:
        raise HTTPException(status_code=403, detail="Não tens permissão para apagar este comentário.")

    supabase.table("plant_comments").delete().eq("id", comment_id).execute()
    return {"deleted": True, "id": comment_id}