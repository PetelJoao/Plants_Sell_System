# models/chat_model.py
from models.db import get_supabase_admin

async def get_or_create_conversation(user1_id: str, user2_id: str, evento_id: str):
    supabase = get_supabase_admin()
    u1, u2 = str(user1_id), str(user2_id)

    existing = supabase.table("conversations").select("*").eq("evento_id", evento_id).or_(
        f"and(user1_id.eq.{u1},user2_id.eq.{u2}),"
        f"and(user1_id.eq.{u2},user2_id.eq.{u1})"
    ).execute()

    if existing.data:
        return existing.data[0]

    new_conv = supabase.table("conversations").insert({
        "user1_id": u1,
        "user2_id": u2,
        "evento_id": evento_id,
    }).execute()
    return new_conv.data[0]

async def get_messages(conversation_id: str):
    supabase = get_supabase_admin()
    response = (
        supabase.table("chat_messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    return response.data


async def save_message(conversation_id: str, sender_id: str, sender_name: str, content: str):
    supabase = get_supabase_admin()
    response = supabase.table("chat_messages").insert({
        "conversation_id": str(conversation_id),
        "sender_id": str(sender_id),
        "sender_name": sender_name,
        "content": content,
    }).execute()
    return response.data[0]


async def get_user_basic(user_id: str):
    """Busca nome de um utilizador específico (para o cabeçalho do chat)"""
    supabase = get_supabase_admin()
    response = supabase.table("usuario").select("id, nome").eq("id", user_id).single().execute()
    return response.data