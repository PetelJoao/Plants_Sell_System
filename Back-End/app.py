import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.auth import auth_router
from routes.users import users_router 
from routes.dashboard import dashboard_router
from routes.admin import admin_router
from routes.payments_route import router
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(router, prefix="/api/payments")
app.include_router(auth_router,  prefix="/api/auth")
app.include_router(users_router, prefix="/api/users")  
app.include_router(dashboard_router, prefix="/api/dashboard")
app.include_router(admin_router,prefix="/api/admin")
@app.get("/api/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)