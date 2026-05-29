import os
from supabase import create_client, Client
from dotenv import load_dotenv


SUPABASE_URL = "https://kikuuhndrprxaynaxfpe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3V1aG5kcnByeGF5bmF4ZnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTM3MzAsImV4cCI6MjA3NzE2OTczMH0.rJCLyN4DzlAmfsytqw7iMRZaHxHnC0Jhu7uBZ8w5FMI"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

response = supabase.table("usuario").select("*").execute()
print(response.data)

