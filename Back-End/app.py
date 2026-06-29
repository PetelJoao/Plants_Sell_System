import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv




load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # temporariamente usa * para testar
    allow_credentials=False,  # com allow_origins=["*"], credentials deve ser False
    allow_methods=["*"],
    allow_headers=["*"],
)
from routes.auth import auth_router
from routes.users import users_router
from routes.dashboard import dashboard_router
from routes.admin import admin_router
from routes.payments_route import router
from routes.events import events_router         
from routes.carrinho_route import router as carrinho_router
from routes.chat import chat_router
from routes.comments_route import comments_router

app.include_router(comments_router, prefix="/api/comments")
app.include_router(chat_router, prefix="/api/chat")
app.include_router(router,           prefix="/api/payments")
app.include_router(auth_router,      prefix="/api/auth")
app.include_router(users_router,     prefix="/api/users")
app.include_router(dashboard_router, prefix="/api/dashboard")
app.include_router(admin_router,     prefix="/api/admin")
app.include_router(events_router,    prefix="/api/eventos")  
app.include_router(carrinho_router,   prefix="/api/carrinho")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
