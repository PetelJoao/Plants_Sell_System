import os
import jwt
from fastapi import Request, HTTPException
from dotenv import load_dotenv

load_dotenv()

async def get_current_user(request: Request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Token em falta')

    token = auth_header.split(' ', 1)[1]
    secret = os.getenv('SUPABASE_JWT_SECRET')

    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=['HS256'],
            audience='authenticated'
        )

        # ✅ Lê directo do JWT — sem chamada extra ao Supabase
        user_metadata = payload.get('user_metadata', {})

        return {
            'id':    payload['sub'],
            'email': payload.get('email'),
            'role':  user_metadata.get('tipo', 'cliente'),  # ← era metadata de sb_user
            'nome':  user_metadata.get('nome', payload.get('email')),
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expirado')
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f'Token inválido: {str(e)}')