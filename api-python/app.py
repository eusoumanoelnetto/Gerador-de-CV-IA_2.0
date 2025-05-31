from flask import Flask, request, jsonify, send_file, render_template_string
import os
from playwright.sync_api import sync_playwright
import webbrowser

app = Flask(__name__)

# ====================
# 🧠 Funções Core
# ====================

def gerar_html(dados):
    with open('modelo.html', 'r', encoding='utf-8') as file:
        template = file.read()

    html = template
    for key, value in dados.items():
        html = html.replace(f'{{{{{key}}}}}', value)
    return html

def gerar_pdf(html_content, output_file):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html_content)
        page.pdf(path=output_file, format="A4")
        browser.close()

# ====================
# 🚀 API Endpoint
# ====================

@app.route('/')
def home():
    return "<h2>🧠 API do Gerador de Currículo IA rodando ✔️</h2>"

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

# ====================
# 🖥️ Modo Terminal
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
    modo = input("\nEscolha o modo:\n1️⃣ API Flask\n2️⃣ Terminal\n→ Digite 1 ou 2: ")

    if modo == '1':
        print("\n🚀 API rodando em http://localhost:5000")
        app.run(debug=True)
    elif modo == '2':
        modo_terminal()
    else:
        print("❌ Opção inválida. Encerrando...")
