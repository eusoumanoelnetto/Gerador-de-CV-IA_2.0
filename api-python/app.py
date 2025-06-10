import pdfkit
import webbrowser
import instaloader
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, origins=[
    "https://eusoumanoelnetto.github.io",
    "https://eusoumanoelnetto.github.io/Gerador-de-CV-IA_2.0"
], supports_credentials=True)

UPLOAD_FOLDER = 'assets'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 4 * 1024 * 1024  # 4MB

@app.route('/')
def index():
    return 'API online! 🚀'

@app.route('/upload-foto', methods=['POST', 'OPTIONS'])
def upload_foto():
    if request.method == "OPTIONS":
        return '', 200
    try:
        # Aceita tanto 'foto' quanto 'file' para compatibilidade
        file = request.files.get('foto') or request.files.get('file')
        if not file:
            return jsonify({'error': 'No file'}), 400
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        from werkzeug.utils import secure_filename
        filename = secure_filename(file.filename.replace(' ', '_'))
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        url = request.url_root.rstrip('/') + '/assets/' + filename
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

@app.route('/foto-perfil', methods=['POST', 'OPTIONS'])
def foto_perfil():
    if request.method == 'OPTIONS':
        return '', 200

    # Verifica se arquivo foi enviado
    if 'file' not in request.files:
        return jsonify({'erro': 'Nenhum arquivo enviado'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'erro': 'Nome do arquivo vazio'}), 400

    try:
        filename = file.filename.replace(" ", "_")
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(path)
        url = f"https://gerador-de-cv-ia-2-0.onrender.com/assets/{filename}"
        return jsonify({'foto_url': url}), 200
    except Exception as e:
        return jsonify({'erro': f'Erro ao salvar: {str(e)}'}), 500

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        return '', 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
