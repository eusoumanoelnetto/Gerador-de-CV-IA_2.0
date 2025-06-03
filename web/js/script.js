const API_URL = 'https://gerador-de-cv-ia-2-0.onrender.com/gerar-curriculo';

const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const previewContainer = document.getElementById('preview-container');

const dadosCurriculo = {
    nome: '',
    cargo: '',
    email: '',
    telefone: '',
    foto_url: 'assets/default-avatar.jpg',
    experiencias: '',
    formacoes: '',
    hard: '',
    soft: '',
    idiomas: ''
};

let etapaFoto = 0;
let redeEscolhida = '';

const perguntas = [
    { chave: 'nome', pergunta: '🧠 Qual seu nome completo?' },
    { 
        chave: 'foto', 
        pergunta: '📸 De onde vem sua foto?\n(Digite 1, 2, 3 ou 4)\n\n1️⃣ Instagram\n2️⃣ Facebook\n3️⃣ LinkedIn\n4️⃣ Enviar Foto do Computador' 
    },
    { chave: 'foto_username', pergunta: '🔗 Informe seu nome de usuário (sem @) ou cole o link se escolheu opção 4.' },
    { chave: 'cargo', pergunta: '💼 Qual seu cargo ou profissão?' },
    { chave: 'email', pergunta: '📧 Informe seu e-mail.' },
    { chave: 'telefone', pergunta: '📱 Informe seu telefone.' },
    { chave: 'experiencias', pergunta: '🛠️ Descreva suas experiências (Cargo | Empresa | Período | Descrição). Separe cada uma com ponto e vírgula.' },
    { chave: 'formacoes', pergunta: '🎓 Descreva sua formação acadêmica (Curso | Instituição | Período). Separe por ponto e vírgula.' },
    { chave: 'hard', pergunta: '🧠 Quais são suas Hard Skills? (Separe por vírgula)' },
    { chave: 'soft', pergunta: '💡 Quais são suas Soft Skills? (Separe por vírgula)' },
    { chave: 'idiomas', pergunta: '🌍 Quais idiomas você fala? (Separe por vírgula)' }
];

let indexPergunta = 0;

window.onload = () => {
    adicionarMensagem('bot', '🧠 Olá! Eu sou o Gerador de Currículo IA. Bora montar seu currículo juntos!');
    fazerPergunta();
};

function fazerPergunta() {
    if (indexPergunta < perguntas.length) {
        adicionarMensagem('bot', perguntas[indexPergunta].pergunta);
    } else {
        adicionarMensagem('bot', 'Perfeito! Gerando preview do seu currículo... ⏳');
        gerarCurriculoPreview(dadosCurriculo); // Mostra o currículo no container
        previewContainer.style.display = 'block';
    }
}

function mostrarInputUploadNoChat() {
    const botBubble = document.createElement('div');
    botBubble.className = "message bot upload-bubble";
    botBubble.innerHTML = `
        <div id="preview-img-wrapper" class="preview-img-wrapper" style="display:none;">
            <img id="preview-img" />
        </div>
        <div class="upload-label">
            <span>🏠 Envie a foto do seu computador:</span>
        </div>
        <div class="upload-btn-wrapper">
            <label class="custom-file-upload" id="upload-btn">
                <input type="file" accept="image/*" id="chat-file-input">
                <span id="upload-btn-text">📁 Selecionar foto</span>
            </label>
        </div>
        <div id="upload-success" style="display:none;"></div>
    `;
    chat.appendChild(botBubble);
    chat.scrollTop = chat.scrollHeight;

    const fileInput = botBubble.querySelector('#chat-file-input');
    const uploadBtn = botBubble.querySelector('#upload-btn');
    const uploadBtnText = botBubble.querySelector('#upload-btn-text');
    const uploadSuccess = botBubble.querySelector('#upload-success');
    const previewImgWrapper = botBubble.querySelector('#preview-img-wrapper');
    const previewImg = botBubble.querySelector('#preview-img');

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewImgWrapper.style.display = 'flex';
                previewImg.style.display = 'block';
                dadosCurriculo['foto_url'] = e.target.result; // base64 do FileReader

                // Remove o botão após upload
                uploadBtn.style.display = "none";

                // Mensagem visual de sucesso centralizada
                uploadSuccess.style.display = "flex";
                uploadSuccess.innerHTML = `<span class="success-upload"><span class="success-icon">✅</span> Foto enviada!</span>`;

                // Após upload, pula direto para próxima pergunta (sem pedir username)
                setTimeout(() => {
                    indexPergunta += 2;
                    fazerPergunta();
                }, 1200);
            }
            reader.readAsDataURL(file);
        }
    });
}

function handleUserInput() {
    const input = userInput.value.trim();
    if (!input) return;

    adicionarMensagem('user', input);

    const chaveAtual = perguntas[indexPergunta].chave;

    if (chaveAtual === 'foto') {
        if (['1', '2', '3', '4'].includes(input)) {
            redeEscolhida = input;
            if (input === '4') {
                mostrarInputUploadNoChat();
                userInput.value = '';
                // NÃO incrementa indexPergunta, nem faz a próxima pergunta aqui!
                return;
            } else {
                indexPergunta++;
                fazerPergunta();
            }
        } else {
            adicionarMensagem('bot', '❌ Opção inválida. Digite 1, 2, 3 ou 4.');
        }
        userInput.value = '';
        return;
    }

    // Novo fluxo: busca foto via backend!
    if (chaveAtual === 'foto_username') {
        if (redeEscolhida === '4') {
            // Não faz nada, já está esperando upload. Não mostra essa pergunta.
            return;
        } else {
            adicionarMensagem('bot', '⏳ Baixando sua foto de perfil...');
            fetch('https://gerador-de-cv-ia-2-0.onrender.com/foto-perfil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: input })
            })
            .then(r => r.json())
            .then(data => {
                // Sempre monta a URL completa!
                dadosCurriculo.foto_url = 'https://gerador-de-cv-ia-2-0.onrender.com' + data.foto_url;
                adicionarMensagem('bot', '📥 Foto de perfil encontrada!');
                indexPergunta++;
                fazerPergunta();
            })
            .catch(err => {
                adicionarMensagem('bot', '❌ Erro ao obter foto. Usando avatar padrão.');
                dadosCurriculo.foto_url = 'assets/default-avatar.jpg';
                indexPergunta++;
                fazerPergunta();
            });

            userInput.value = '';
            return;
        }
    }

    dadosCurriculo[chaveAtual] = input;
    userInput.value = '';
    indexPergunta++;
    setTimeout(fazerPergunta, 500);
}

function adicionarMensagem(remetente, texto) {
    const div = document.createElement('div');
    div.classList.add('message', remetente);
    // Permite HTML para mensagens especiais
    if (texto.startsWith('<span class="success-upload">')) {
        div.innerHTML = texto;
    } else {
        div.innerText = texto;
    }
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

const templateCurriculo = `
<div class="w3-content w3-margin-top" style="max-width:1400px;">
  <div class="curriculo">
    <!-- 🔹 Sidebar -->
    <div class="sidebar">
        <img src="{{FOTO_URL}}" class="profile-img" alt="Avatar" onerror="this.onerror=null;this.src='assets/default-avatar.jpg';">
        <h2 id="nome-placeholder">{{NOME}}</h2>
        <p id="cargo-placeholder">{{CARGO}}</p>
        <p id="email-placeholder">{{EMAIL}}</p>
        <p id="telefone-placeholder">{{TELEFONE}}</p>
        <h3>Habilidades</h3>
        <p><b>Hard Skills:</b> <span id="hard-placeholder">{{HARD}}</span></p>
        <p><b>Soft Skills:</b> <span id="soft-placeholder">{{SOFT}}</span></p>
        <p><b>Idiomas:</b> <span id="idiomas-placeholder">{{IDIOMAS}}</span></p>
    </div>
    <!-- 🔸 Conteúdo -->
    <div class="content">
        <h1>Currículo <span id="nome-placeholder2">{{NOME}}</span></h1>
        <h2>Experiência</h2>
        <ul id="exp-placeholder">{{EXPERIENCIAS}}</ul>
        <h2>Formação</h2>
        <ul id="form-placeholder">{{FORMACOES}}</ul>
    </div>
  </div>
</div>
`;

function gerarCurriculoPreview(dadosCurriculo) {
  let html = templateCurriculo
    .replace(/{{FOTO_URL}}/g, dadosCurriculo.foto_url)
    .replace(/{{NOME}}/g, dadosCurriculo.nome || '')
    .replace(/{{CARGO}}/g, dadosCurriculo.cargo || '')
    .replace(/{{EMAIL}}/g, dadosCurriculo.email || '')
    .replace(/{{TELEFONE}}/g, dadosCurriculo.telefone || '')
    .replace(/{{HARD}}/g, dadosCurriculo.hard || '')
    .replace(/{{SOFT}}/g, dadosCurriculo.soft || '')
    .replace(/{{IDIOMAS}}/g, dadosCurriculo.idiomas || '')
    .replace(/{{EXPERIENCIAS}}/g, dadosCurriculo.experiencias
      ? dadosCurriculo.experiencias.split(';').map(e => `<li>${e.trim()}</li>`).join('')
      : '')
    .replace(/{{FORMACOES}}/g, dadosCurriculo.formacoes
      ? dadosCurriculo.formacoes.split(';').map(f => `<li>${f.trim()}</li>`).join('')
      : '');

  // Limpa o container antes de inserir o novo currículo
  const container = document.getElementById('curriculo-container');
  container.innerHTML = '';
  container.innerHTML = html;
}

async function baixarPDF() {
    try {
        adicionarMensagem('bot', '📄 Gerando seu PDF... ⏳');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCurriculo)
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `curriculo-${dadosCurriculo.nome}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
        adicionarMensagem('bot', '✔️ PDF gerado e baixado com sucesso!');
    } catch (error) {
        adicionarMensagem('bot', '❌ Erro ao gerar PDF. Verifique sua conexão com a API.');
        console.error(error);
    }
}

function mostrarBotaoReiniciar() {
    const botao = document.createElement('button');
    botao.innerText = '🔄 Reiniciar Chat';
    botao.classList.add('restart-button');
    botao.onclick = reiniciarChat;
    chat.appendChild(botao);
    chat.scrollTop = chat.scrollHeight;
}

function reiniciarChat() {
    indexPergunta = 0;
    for (let chave in dadosCurriculo) {
        dadosCurriculo[chave] = '';
    }
    chat.innerHTML = '';
    previewContainer.style.display = 'none';
    adicionarMensagem('bot', '🧠 Olá! Vamos começar novamente.');
    fazerPergunta();
}
