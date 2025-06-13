from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

DB_USER = 'root'
DB_PASSWORD = '1234petel' # Mude para a sua senha do workbench antes de executar
DB_HOST = 'localhost'
DB_PORT = '3306'
DB_NAME = 'duria'


app.config['SQLALCHEMY_DATABASE_URI'] = (
        f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    )

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Desativa o rastreamento de modificações para economizar memória

db = SQLAlchemy(app)

class planta(db.Model):
   
    __tablename__ = 'planta'
    IdPlanta = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Nome_Planta = db.Column(db.String(45), nullable=False)
    Topologia_Planta = db.Column(db.String(45))
    Dimensao_Planta = db.Column(db.String(70))
    Descricao_Planta = db.Column(db.String(255))
    NumeroComodos_Planta = db.Column(db.Integer)
    Preco_Planta = db.Column(db.Integer)
    Orcamento_Planta = db.Column(db.String(64))
    IdArquiteto = db.Column(db.Integer) 

    def __repr__(self):
        # Retorna uma representação legível do objeto planta
        return f'<Planta {self.Nome_Planta}>'

    def to_dict(self):
        return {
            'id': self.IdPlanta,
            'title': self.Nome_Planta,
            'Topologia_Planta': self.Topologia_Planta,
            'Dimensao_Planta': self.Dimensao_Planta,
            'description': self.Descricao_Planta,
            'NumeroComodos_Planta': self.NumeroComodos_Planta,
            'price': self.Preco_Planta,
            'Orcamento_Planta': self.Orcamento_Planta,
            'IdArquiteto': self.IdArquiteto  
        }


@app.route('/dashboard')
def dashboard():

    try:
        with app.app_context():
    
            all_plantas = planta.query.all()

            
            plantas_list = [p.to_dict() for p in all_plantas]

            return jsonify({
                'status': 'success',
                'message': f'{len(plantas_list)} plantas encontradas.',
                'plantas_data': plantas_list
            }), 200
        
    except Exception as e:
        
        return jsonify({
            'status': 'error',
            'message': f'Falha ao buscar dados da tabela planta. Erro: {str(e)}'
        }), 500
    
if __name__ == '__main__':

    app.run(debug=True)
