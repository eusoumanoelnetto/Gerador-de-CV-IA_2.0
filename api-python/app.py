from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import pdfkit
import webbrowser
import instaloader
import sys

app = Flask(__name__)
CORS(app, origins=[
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://eusoumanoelnetto.github.io",
    "https://eusoumanoelnetto.github.io/Gerador-de-CV-IA_2.0"
], methods=['GET', 'POST', 'OPTIONS'])

# Garante que a pasta 'assets' existe
if not os.path.exists('assets'):
    os.makedirs('assets')

# ====================
# 🧠 Funções Core
# ====================

def gerar_html(dados):
    with open('templates/curriculo.html', 'r', encoding='utf-8') as file:
        template = file.read()
    foto_path = dados.get('foto_url', 'assets/default-avatar.jpg')
    html = template.replace('{{foto_path}}', foto_path)
    for key, value in dados.items():
        html = html.replace(f'{{{{{key}}}}}', value)
    return html

def gerar_pdf(html_content, output_file):
    config = pdfkit.configuration(wkhtmltopdf=os.path.join('bin', 'wkhtmltopdf'))
    pdfkit.from_string(html_content, output_file, configuration=config)

def baixar_perfil_instagram(username):
    import uuid
    L = instaloader.Instaloader(dirname_pattern="assets", save_metadata=False, download_videos=False)
    profile = instaloader.Profile.from_username(L.context, username)
    # Gera nome único
    unique_id = uuid.uuid4().hex[:8]
    img_path = f"assets/avatar_{username}_{unique_id}.jpg"
    # Baixa a foto de perfil (pode vir como .jpg ou .png)
    L.download_profilepic(profile)
    # Descobre o nome real do arquivo baixado (pode ter extensão .png)
    for file in os.listdir('assets'):
        if file.startswith(username) and (file.endswith('.jpg') or file.endswith('.png')):
            real_path = f"assets/{file}"
            from PIL import Image
            im = Image.open(real_path).convert('RGB')
            im.save(img_path, "JPEG")
            os.remove(real_path)
            break
    return f"/assets/{os.path.basename(img_path)}"

# ====================
# 🚀 API Endpoint
# ====================

@app.route("/")
def home():
    return "API do Gerador de CV IA está online! 🚀"

@app.route('/gerar-curriculo', methods=['POST'])
def gerar_curriculo():
    data = request.json

    required_fields = ['nome', 'cargo', 'email', 'telefone', 'experiencias', 'formacoes', 'hard', 'soft', 'idiomas', 'foto_url']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} faltando'}), 400

    dados = {
        'nome': data['nome'],
        'cargo': data['cargo'],
        'email': data['email'],
        'telefone': data['telefone'],
        'experiencias': data['experiencias'],
        'formacoes': data['formacoes'],
        'hard': data['hard'],
        'soft': data['soft'],
        'idiomas': data['idiomas'],
        'foto_url': data['foto_url'] or 'assets/default-avatar.jpg',
        'foto_path': data['foto_url'] or 'assets/default-avatar.jpg'
    }

    html_content = gerar_html(dados)

    with open('preview.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

    pdf_path = 'curriculo.pdf'
    gerar_pdf(html_content, pdf_path)

    return send_file(pdf_path, mimetype='application/pdf', as_attachment=True, download_name='curriculo.pdf')

@app.route('/gerar-pdf', methods=['POST'])
def gerar_pdf_endpoint():
    data = request.json

    required_fields = ['nome', 'cargo', 'email', 'telefone', 'experiencias', 'formacoes', 'hard', 'soft', 'idiomas', 'foto_url']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} faltando'}), 400

    dados = {
        'nome': data['nome'],
        'cargo': data['cargo'],
        'email': data['email'],
        'telefone': data['telefone'],
        'experiencias': data['experiencias'],
        'formacoes': data['formacoes'],
        'hard': data['hard'],
        'soft': data['soft'],
        'idiomas': data['idiomas'],
        'foto_url': data['foto_url'] or 'assets/default-avatar.jpg',
        'foto_path': data['foto_url'] or 'assets/default-avatar.jpg'
    }

    html_content = gerar_html(dados)

    pdf_file = 'curriculo_gerado.pdf'
    gerar_pdf(html_content, pdf_file)

    import os

    if not os.path.exists(pdf_file) or os.path.getsize(pdf_file) == 0:
        return jsonify({'erro': 'PDF não gerado corretamente.'}), 500

    return send_file(pdf_file, mimetype='application/pdf', as_attachment=True, download_name='curriculo.pdf')

@app.route('/foto-perfil', methods=['POST'])
def foto_perfil():
    data = request.json
    username = data.get('username')
    if not username:
        return jsonify({"erro": "Username obrigatório"}), 400
    try:
        foto_url = baixar_perfil_instagram(username)
        return jsonify({'foto_url': foto_url})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/assets/<path:filename>')
def serve_foto(filename):
    return send_from_directory('assets', filename)

@app.route('/upload-foto', methods=['POST'])
def upload_foto():
    if 'foto' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    file = request.files['foto']
    if file.filename == '':
        return jsonify({'error': 'Nome de arquivo vazio'}), 400
    filename = file.filename
    save_path = os.path.join('assets', filename)
    file.save(save_path)
    url = f"https://gerador-de-cv-ia-2-0.onrender.com/assets/{filename}"
    return jsonify({'foto_url': url})

# ====================
# 🖥️ Modo Terminal Local
# ====================

def modo_terminal():
    print("=== 🧠 Atualizador de Currículo (Modo Terminal) ===")

    nome = input("Nome completo: ")
    cargo = input("Cargo: ")
    email = input("Email: ")
    telefone = input("Telefone: ")
    foto_url = input("URL da foto (ou local): ")

    experiencias = input("Experiências (ex.: Cargo | Empresa | Período | Descrição): ")
    formacoes = input("Formação (Curso | Instituição | Período): ")
    hard = input("Hard Skills (separadas por vírgula): ")
    soft = input("Soft Skills (separadas por vírgula): ")
    idiomas = input("Idiomas (separados por vírgula): ")

    dados = {
        'nome': nome,
        'cargo': cargo,
        'email': email,
        'telefone': telefone,
        'foto_url': foto_url,
        'experiencias': experiencias,
        'formacoes': formacoes,
        'hard': hard,
        'soft': soft,
        'idiomas': idiomas
    }

    html_content = gerar_html(dados)

    with open('preview.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

    gerar_pdf(html_content, 'curriculo.pdf')

    print("\n✅ Currículo gerado!")
    webbrowser.open('file://' + os.path.realpath('preview.html'))
    print("📄 Também gerado: curriculo.pdf")

# ====================
# 🔥 Inicializador
# ====================

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)
