from flask import Blueprint, request, jsonify
from models.db import get_supabase_admin
import traceback
auth_bp = Blueprint('auth', __name__)
from middlewares.auth import auth_required, get_current_user



@auth_bp.route('/me', methods=['GET'])
@auth_required
def me():
    user = get_current_user()
    return jsonify({
        'id':    user['id'],
        'email': user['email'],
        'role':  user['role'],
        'nome':  user.get('nome', user['email'])
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    sb   = get_supabase_admin()
    data = request.get_json()
    data = request.get_json(force=True, silent=True) or {}
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')
    role     = data.get('role', '')

    if not name or not email or not password:
        return jsonify({'error': 'Campos obrigatórios em falta'}), 400

    try:
        
        auth_res = sb.auth.admin.create_user({
            'email':    email,
            'password': password,
            'email_confirm': True,
            'user_metadata': {'nome': name, 'tipo': role} 
        })
        
        user_id = auth_res.user.id

        return jsonify({'id': user_id, 'name': name, 'email': email, 'role': role}), 201

    except Exception as e:
        err = str(e)
        traceback.print_exc() 
        if 'already registered' in err or 'duplicate' in err.lower():
            return jsonify({'error': 'Este email já está registado.'}), 409
        return jsonify({'error': err}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    sb   = get_supabase_admin()
    data = request.get_json()

    email    = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email e password obrigatórios'}), 400

    try:
        res = sb.auth.sign_in_with_password({'email': email, 'password': password})
        return jsonify({
            'token': res.session.access_token,
            'user':  {'id': res.user.id, 'email': res.user.email}
        }), 200

    except Exception as e:
        return jsonify({'error': 'Credenciais inválidas'}), 401