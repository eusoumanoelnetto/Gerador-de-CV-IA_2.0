import pdfkit
import webbrowser
import instaloader
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Permite acesso de qualquer origem. Para produção, especifique o domínio.

UPLOAD_FOLDER = 'assets'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload-foto', methods=['POST'])
def upload_foto():
    try:
        if 'foto' not in request.files:
            return jsonify({'error': 'No file'}), 400
        file = request.files['foto']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        from werkzeug.utils import secure_filename
        filename = secure_filename(file.filename.replace(' ', '_'))
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        url = f'/assets/{filename}'
        return jsonify({'foto_url': url}), 200
    except Exception as e:
        import traceback
        print('Erro no upload:', traceback.format_exc())
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/assets/<filename>')
def serve_foto(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/ping')
def ping():
    return 'pong', 200

if __name__ == "__main__":
    # Para rodar sempre na porta 5000 localmente
    app.run(host='127.0.0.1', port=5000, debug=True)
