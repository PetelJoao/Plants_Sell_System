import os
import jwt
from functools import wraps
from flask import request, jsonify, g
from dotenv import load_dotenv

load_dotenv()

def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token em falta'}), 401

        token = auth_header.split(' ', 1)[1]
        secret = os.getenv('SUPABASE_JWT_SECRET')

        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=['HS256'],
                audience='authenticated'
            )

            # vai buscar os dados atualizados ao Supabase
            from models.db import get_supabase_admin
            sb = get_supabase_admin()
            sb_user = sb.auth.admin.get_user_by_id(payload['sub'])
            metadata = sb_user.user.user_metadata or {}

            g.user = {
                'id':    payload['sub'],
                'email': payload.get('email'),
                'role':  metadata.get('tipo', 'cliente'),  # ← dados frescos
                'nome':  metadata.get('nome', payload.get('email'))
            }

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'error': f'Token inválido: {str(e)}'}), 401

        return fn(*args, **kwargs)
    return wrapper

def get_current_user():
    return g.get('user')
