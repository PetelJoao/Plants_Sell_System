from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import  CORSMiddleware
from supabase import  create_client , Client
import os


app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()
DataBaseURL = os.getenv("SUPABASE_URL")
DATABASEKEY =  os.getenv("SUPABASE_KEY")


if not DataBaseURL or not DATABASEKEY :
    raise ValueError("As chaves de APi não foram definidas ")

supabase : Client = create_client(DataBaseURL ,DATABASEKEY )


@app.get('/dashboard')
async def DashboardLoad():

    try:
        response = (
            supabase.table("planta").
            select("*").
            execute()
        )
    except Exception as exception:
        return exception

    return  response