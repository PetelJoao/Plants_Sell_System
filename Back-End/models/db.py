import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

load_dotenv()

_client: Client | None = None

def get_supabase_admin() -> Client:
    global _client
    if _client is None:
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_KEY')
        _client = create_client(url, key)
    return _client