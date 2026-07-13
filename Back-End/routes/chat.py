from fastapi import APIRouter, Depends
from pydantic import BaseModel
from middlewares.auth import get_current_user
from models.chat_model import (
    get_or_create_conversation,
    get_messages,
    save_message,
    get_user_basic,
)

chat_router = APIRouter(tags=["chat"])

class MessagePayload(BaseModel):
    conversation_id: str
    content: str

class StartConversationPayload(BaseModel):
    target_user_id: str
    evento_id: str | None = None

@chat_router.get("/user/{user_id}")
async def get_target_user(user_id: str, user: dict = Depends(get_current_user)):
    """Busca dados do outro participante (para mostrar nome no cabeçalho)"""
    return await get_user_basic(user_id)

@chat_router.post("/conversations")
async def start_conversation(
    payload: StartConversationPayload,
    user: dict = Depends(get_current_user)
):
    if not payload.evento_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="evento_id é obrigatório")
    return await get_or_create_conversation(
        user["id"], payload.target_user_id, payload.evento_id
    )

@chat_router.get("/conversations/{conversation_id}/messages")
async def load_messages(conversation_id: str):
    return await get_messages(conversation_id)

@chat_router.post("/messages")
async def post_message(
    payload: MessagePayload,
    user: dict = Depends(get_current_user)
):
    return await save_message(
        payload.conversation_id,
        user["id"],
        user["nome"],
        payload.content,
    )