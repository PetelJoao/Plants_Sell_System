from flask import request, jsonify
from models.db import get_supabase_admin
from middlewares.auth import get_current_user

def get_all():
    sb = get_supabase_admin()
    res = sb.table('usuarios').select('id, nome, email, tipo_id, criado_em').execute()
    return jsonify(res.data), 200


def get_by_id(user_id):
    sb = get_supabase_admin()
    res = sb.table('usuarios').select('id, nome, email, tipo_id, criado_em').eq('id', user_id).single().execute()
    if not res.data:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    return jsonify(res.data), 200


def create():
    sb   = get_supabase_admin()
    data = request.get_json()

    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')
    role     = data.get('role', '').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Campos obrigatórios em falta'}), 400

    try:

        auth_res = sb.auth.admin.create_user({
            'email':    email,
            'password': password,
            'email_confirm': True,
            'user_metadata': {'nome': name, 'tipo_id': role}
        })
        user_id = auth_res.user.id


        
       
        return jsonify({'id': user_id, 'name': name, 'email': email, 'role': role}), 201

    except Exception as e:
        err = str(e)
        if 'already registered' in err or 'duplicate' in err.lower():
            return jsonify({'error': 'Este email já está registado.'}), 409
        return jsonify({'error': err}), 500


def update(user_id):
    sb   = get_supabase_admin()
    data = request.get_json()
    sb.table('usuarios').update({
        'nome':    data.get('name'),
        'email':   data.get('email'),
        'tipo_id': data.get('role')
    }).eq('id', user_id).execute()
    return jsonify({'message': 'Usuário atualizado'}), 200


def remove(user_id):
    sb = get_supabase_admin()
    sb.auth.admin.delete_user(user_id)   
    return jsonify({'message': 'Usuário removido'}), 200
