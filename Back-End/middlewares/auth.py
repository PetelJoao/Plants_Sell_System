import os
import jwt
from fastapi import Request, HTTPException
from dotenv import load_dotenv
from fastapi import Request, HTTPException, Depends

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


        user_metadata = payload.get('user_metadata', {})

        return {
            'id':    payload['sub'],
            'email': payload.get('email'),
            'role':  user_metadata.get('tipo', 'cliente'),  
            'nome':  user_metadata.get('nome', payload.get('email')),
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expirado')
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f'Token inválido: {str(e)}')
    

async def get_current_admin(user: dict = Depends(get_current_user)):
    """
    Garante que o utilizador autenticado é um administrador.
    Reaproveita get_current_user, por isso token inválido/em falta
    já é tratado lá (401).
    """
    if user.get("role") != "administrador":
        raise HTTPException(
            status_code=403,
            detail="Acesso restrito a administradores."
        )
    return user