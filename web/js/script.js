const API_URL = 'https://gerador-de-cv-ia-2-0.onrender.com/gerar-curriculo';

const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const previewContainer = document.getElementById('preview-container');

const dadosCurriculo = {
    nome: '',
    cargo: '',
    email: '',
    telefone: '',
    foto_url: '',
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
        preencherPreview();
        previewContainer.style.display = 'block';
    }
}

function gerarLinkFoto(rede, username) {
    switch (rede) {
        case '1':
            return `https://www.instagram.com/${username}/picture`;
        case '2':
            return `https://graph.facebook.com/${username}/picture?type=large`;
        case '3':
            return `https://www.linkedin.com/in/${username}/picture`;
        case '4':
            return username;
        default:
            return '';
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
                dadosCurriculo['foto_url'] = e.target.result;

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

    if (chaveAtual === 'foto_username') {
        if (redeEscolhida === '4') {
            // Não faz nada, já está esperando upload. Não mostra essa pergunta.
            return;
        } else {
            dadosCurriculo['foto_url'] = gerarLinkFoto(redeEscolhida, input);
            indexPergunta++;
            userInput.value = '';
            fazerPergunta();
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

function preencherPreview() {
    document.getElementById('nome-placeholder').innerText = dadosCurriculo.nome;
    document.getElementById('nome-placeholder2').innerText = dadosCurriculo.nome;
    document.getElementById('cargo-placeholder').innerText = dadosCurriculo.cargo;
    document.getElementById('email-placeholder').innerText = dadosCurriculo.email;
    document.getElementById('telefone-placeholder').innerText = dadosCurriculo.telefone;
    document.querySelector('.profile-img').src = dadosCurriculo.foto_url;

    document.getElementById('hard-placeholder').innerText = dadosCurriculo.hard;
    document.getElementById('soft-placeholder').innerText = dadosCurriculo.soft;
    document.getElementById('idiomas-placeholder').innerText = dadosCurriculo.idiomas;

    const expList = document.getElementById('exp-placeholder');
    expList.innerHTML = '';
    dadosCurriculo.experiencias.split(';').forEach(item => {
        const li = document.createElement('li');
        li.innerText = item.trim();
        expList.appendChild(li);
    });

    const formList = document.getElementById('form-placeholder');
    formList.innerHTML = '';
    dadosCurriculo.formacoes.split(';').forEach(item => {
        const li = document.createElement('li');
        li.innerText = item.trim();
        formList.appendChild(li);
    });
}

async function baixarPDF() {
    try {
        adicionarMensagem('bot', '📄 Gerando seu PDF... ⏳');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCurriculo)
        });

        // LOGS para debug
        console.log(response);
        console.log(await response.text()); // Só para ver se está vindo HTML de erro

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

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('file-name').textContent = file.name;
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('preview-img');
      preview.src = e.target.result;
      preview.style.display = 'block';
      // Se quiser salvar no objeto dadosCurriculo:
      dadosCurriculo['foto_url'] = e.target.result;
    }
    reader.readAsDataURL(file);
    // Aqui você pode enviar o arquivo pro backend se desejar
  }
}
