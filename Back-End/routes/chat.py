from fastapi import APIRouter, Depends
from pydantic import BaseModel
from middlewares.auth import get_current_user
from models.chat_model import (
    get_all_users,
    get_or_create_conversation,
    get_messages,
    save_message,
    get_my_conversations,
)

chat_router = APIRouter(tags=["chat"])

class MessagePayload(BaseModel):
    conversation_id: str
    content: str

class StartConversationPayload(BaseModel):
    target_user_id: str

@chat_router.get("/users")
async def list_users(user: dict = Depends(get_current_user)):
    try:
        result = await get_all_users(user["id"])
        return result
    except Exception as e:
        import traceback
        print("ERRO /api/chat/users:", traceback.format_exc())
        raise

@chat_router.post("/conversations")
async def start_conversation(
    payload: StartConversationPayload,
    user: dict = Depends(get_current_user)
):
    """Inicia ou retoma conversa com outro utilizador"""
    conv = await get_or_create_conversation(user["id"], payload.target_user_id)
    return conv

@chat_router.get("/conversations")
async def my_conversations(user: dict = Depends(get_current_user)):
    """Lista conversas do utilizador actual"""
    return await get_my_conversations(user["id"])

@chat_router.get("/conversations/{conversation_id}/messages")
async def load_messages(conversation_id: str):
    return await get_messages(conversation_id)

@chat_router.post("/messages")
async def post_message(
    payload: MessagePayload,
    user: dict = Depends(get_current_user)
):
    msg = await save_message(
        payload.conversation_id,
        user["id"],
        user["nome"],  
        payload.content,
    )
    return msg