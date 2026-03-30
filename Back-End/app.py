import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import sys

from routes.auth import auth_bp
from routes.users import users_bp


load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16mb

CORS(app, 
     origins=["http://localhost:3000"],
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"]
)


app.register_blueprint(auth_bp,  url_prefix='/api/auth')
app.register_blueprint(users_bp)

@app.get('/api/health')
def health():
    return {'status': 'ok'}, 200


@app.route('/favicon.ico')
def favicon():
    return '', 204  

if __name__ == '__main__':
    app.run(debug=True, port=5000)
