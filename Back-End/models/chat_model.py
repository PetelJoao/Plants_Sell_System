from models.db import get_supabase_admin


async def get_all_users(current_user_id: str):
    supabase = get_supabase_admin()
    response = supabase.table("usuario").select("id, nome, email").execute()
    
    seen = set()
    users = []
    for user in response.data:
        uid = str(user["id"]).strip().lower()
        current = str(current_user_id).strip().lower()
        if uid != current and uid not in seen:
            seen.add(uid)
            users.append({
                "id": str(user["id"]),
                "nome": user.get("nome") or "Utilizador",
                "email": user.get("email") or ""
            })
    return users

async def get_or_create_conversation(user1_id: str, user2_id: str):
    """Busca conversa existente ou cria uma nova"""
    supabase = get_supabase_admin()

    # Tenta encontrar conversa nos dois sentidos
    existing = supabase.table("conversations").select("*").or_(
        f"and(user1_id.eq.{user1_id},user2_id.eq.{user2_id}),"
        f"and(user1_id.eq.{user2_id},user2_id.eq.{user1_id})"
    ).execute()

    if existing.data:
        return existing.data[0]

    # Cria nova conversa
    new_conv = supabase.table("conversations").insert({
        "user1_id": user1_id,
        "user2_id": user2_id,
    }).execute()
    return new_conv.data[0]

async def get_messages(conversation_id: str):
    """Busca histórico de mensagens"""
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
    try:
        response = supabase.table("chat_messages").insert({
            "conversation_id": str(conversation_id),
            "sender_id": str(sender_id),
            "sender_name": sender_name,
            "content": content,
        }).execute()
        return response.data[0]
    except Exception as e:
        print("ERRO save_message:", e)
        raise

async def get_my_conversations(user_id: str):
    """Lista todas as conversas do utilizador actual"""
    supabase = get_supabase_admin()
    response = supabase.table("conversations").select("*").or_(
        f"user1_id.eq.{user_id},user2_id.eq.{user_id}"
    ).execute()
    return response.data