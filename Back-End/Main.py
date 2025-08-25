from fastapi import FastAPI, Depends, Form, status
from fastapi.responses import RedirectResponse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from sqlalchemy import Column, Integer, String
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.declarative import declarative_base
from models import Base, Usuario  
import os

app = FastAPI()

origins = [
    "*", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          
    allow_credentials=True,         
    allow_methods=["*"],            
    allow_headers=["*"],            
)

DB_USER = "root"    
DB_PASS = "1234petel"   # cada dev troca pela sua senha ( att isto é so para desenvolvimento)
DB_HOST = "localhost" 
DB_NAME = "duria" 

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Usuario(Base):
    __tablename__ = "usuario"

    IdUsuario = Column(Integer, primary_key=True, index=True)
    Numero_Usuario = Column(String(50), nullable=True)
    Tipo_Usuario = Column(String(50), nullable=True)
    Senha_Usuario = Column(String(255), nullable=False)
    Email_Usuario = Column(String(255), unique=True, nullable=False, index=True)
    Nome_usuario = Column(String(255), nullable=False)


Base = declarative_base()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("http://localhost:3000/Cadastro")
def register(
    email: str = Form(...),
    password: str = Form(...),
    nome: str = Form(...),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(Usuario.Email_Usuario == email).first()
    if usuario:
        return {"error": "Este usuario ja existeee"}
    
    hashed_pwd = pwd_context.hash(password)
    novo_usuario = Usuario(
        Email_Usuario=email,
        Senha_Usuario=hashed_pwd,
        Nome_usuario=nome,
        Tipo_Usuario="....",    
        Numero_Usuario="..."     
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return {"message": "Usuário registrado com sucesso", "user_id": novo_usuario.IdUsuario}


@app.post("http://localhost:3000/login")
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.Email_Usuario == email).first()
    if not usuario:
        
        return RedirectResponse(url="http://localhost:3000/Cadastro", status_code=status.HTTP_303_SEE_OTHER)

    if not pwd_context.verify(password, usuario.Senha_Usuario):
        return {"error": "Senha incorreta"}


    return RedirectResponse(url="http://localhost:3000/dashboard", status_code=status.HTTP_303_SEE_OTHER)


@app.get("http://localhost:3000/dashboard")
def dashboard():
    return {"message": "Bem-vindo à dashboard!"}

@app.get("http://localhost:3000/Cadastro")
def register_page():
    return {"message": "Redirecionado para a página de registro"}
