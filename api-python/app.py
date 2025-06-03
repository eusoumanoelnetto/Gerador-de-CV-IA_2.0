from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import pdfkit
import webbrowser
import instaloader
import sys

app = Flask(__name__)
CORS(app)  # Libera CORS para todo mundo

# OU, para liberar só para seu domínio (mais seguro):
# CORS(app, origins=["https://eusoumanoelnetto.github.io"])

# Garante que a pasta 'assets' existe
if not os.path.exists('assets'):
    os.makedirs('assets')

# ====================
# 🧠 Funções Core
# ====================

def gerar_html(dados):
    with open('templates/curriculo.html', 'r', encoding='utf-8') as file:
        template = file.read()
    html = template
    for key, value in dados.items():
        html = html.replace(f'{{{{{key}}}}}', value)
    return html

def gerar_pdf(html_content, output_file):
    config = pdfkit.configuration(wkhtmltopdf=os.path.join('bin', 'wkhtmltopdf'))
    pdfkit.from_string(html_content, output_file, configuration=config)

def baixar_perfil_instagram(username):
    L = instaloader.Instaloader(dirname_pattern="assets", save_metadata=False, download_videos=False)
    profile = instaloader.Profile.from_username(L.context, username)
    foto_path = f"assets/{username}.jpg"
    # Baixa a foto de perfil (pode vir como .jpg ou .png)
    L.download_profilepic(profile)
    # Descobre o nome real do arquivo baixado (pode ter extensão .png)
    for file in os.listdir('assets'):
        if file.startswith(username) and (file.endswith('.jpg') or file.endswith('.png')):
            real_path = f"assets/{file}"
            # Se não for jpg, converte
            if not file.endswith('.jpg'):
                from PIL import Image
                im = Image.open(real_path).convert('RGB')
                im.save(f"assets/{username}.jpg", "JPEG")
                os.remove(real_path)
            break
    return f"/assets/{username}.jpg"

# ====================
# 🚀 API Endpoint
# ====================

@app.route('/')
def home():
    return "<h2>🧠 API do Gerador de Currículo IA rodando com PDFKit ✔️</h2>"

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
        'foto_url': data['foto_url']
    }

    html_content = gerar_html(dados)

    with open('preview.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

    gerar_pdf(html_content, 'curriculo.pdf')

    return send_file('curriculo.pdf', as_attachment=True)

@app.route('/foto-perfil', methods=['POST'])
def foto_perfil():
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({'error': 'Campo "username" é obrigatório.'}), 400

    try:
        foto_url = baixar_perfil_instagram(username)
        return jsonify({'foto_url': foto_url})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/assets/<path:filename>')
def serve_foto(filename):
    return send_from_directory('assets', filename)

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
    if 'RENDER' in os.environ or 'RAILWAY_STATIC_URL' in os.environ:
        # 🚀 Ambiente de Nuvem → roda API automaticamente
        print("🌐 Rodando API no ambiente de produção (Render/Railway)")
        app.run(host="0.0.0.0", port=5000)
    elif sys.stdin.isatty():
        # 🖥️ Ambiente local → pergunta o modo
        modo = input("\nEscolha o modo:\n1️⃣ API Flask\n2️⃣ Terminal\n→ Digite 1 ou 2: ")

        if modo == '1':
            print("\n🚀 API rodando em http://localhost:5000")
            app.run(debug=True, host="0.0.0.0", port=5000)
        elif modo == '2':
            modo_terminal()
        else:
            print("❌ Opção inválida. Encerrando...")
    else:
        # ✅ Ambiente sem terminal (ex.: Render) → roda API
        app.run(host="0.0.0.0", port=5000)
