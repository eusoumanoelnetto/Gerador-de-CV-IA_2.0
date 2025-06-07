const API_URL = 'https://gerador-de-cv-ia-2-0.onrender.com/gerar-curriculo';

// Troque a URL de produção pela local automaticamente se estiver rodando local
const API_BASE = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:10000"
    : "https://gerador-de-cv-ia-2-0.onrender.com";

const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const previewContainer = document.getElementById('preview-container');
const btnBaixarPDF = document.getElementById('baixarPDF');
const tituloCV = document.getElementById('cv-title');
const btnEnviar = document.getElementById('btnEnviar');

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

let redeEscolhida = '';

const perguntas = [
    { chave: 'nome', pergunta: '🧠 Qual seu nome completo?' },
    { 
        chave: 'foto', 
        pergunta: '📸 De onde vem sua foto?\n(Digite 1, 2, 3 ou 4)\n\n1️⃣ Instagram\n2️⃣ Facebook\n3️⃣ LinkedIn\n4️⃣ Enviar Foto'
    },
    { chave: 'foto_username', pergunta: '🔗 Informe seu nome de usuário (sem @) ou cole o link se escolheu opção 4.' },
    { chave: 'cargo', pergunta: '💼 Qual seu cargo ou profissão?' },
    { chave: 'email', pergunta: '📧 Qual seu email?' },
    { chave: 'telefone', pergunta: '📱 Qual seu telefone?' },
    { chave: 'experiencias', pergunta: '🧰 Descreva suas experiências profissionais (use ";" para separar).' },
    { chave: 'formacoes', pergunta: '🎓 Descreva sua formação acadêmica (use ";" para separar).' },
    { chave: 'hard', pergunta: '💪 Quais são suas Hard Skills? (separadas por vírgula)' },
    { chave: 'soft', pergunta: '🧠 Quais são suas Soft Skills? (separadas por vírgula)' },
    { chave: 'idiomas', pergunta: '🌎 Quais idiomas você fala? (separados por vírgula)' }
];

let indexPergunta = 0;

window.handleUserInput = handleUserInput;

if (btnEnviar) {
    btnEnviar.onclick = handleUserInput;
}

window.onload = () => {
    adicionarMensagem('bot', '🧠 Olá! Eu sou o Gerador de Currículo IA. Bora montar seu currículo juntos!');
    // Esconde tudo ao iniciar ou reiniciar
    tituloCV.style.display = 'none';
    previewContainer.style.display = 'none';
    btnBaixarPDF.style.display = 'none';
};

function fazerPergunta() {
    if (indexPergunta < perguntas.length) {
        adicionarMensagem('bot', perguntas[indexPergunta].pergunta);
    } else {
        adicionarMensagem('bot', 'Perfeito! Gerando preview do seu currículo... ⏳');
        gerarCurriculoPreview(dadosCurriculo);
        previewContainer.style.display = 'block';
        tituloCV.style.display = 'block';
        btnBaixarPDF.style.display = 'block';
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
            const formData = new FormData();
            formData.append('foto', file);

            fetch(`${API_BASE}/upload-foto`, {
                method: 'POST',
                body: formData
            })
            .then(r => r.json())
            .then(data => {
                if (data.foto_url) {
                    dadosCurriculo['foto_url'] = data.foto_url;
                } else {
                    alert('Falha ao enviar a foto. Usando avatar padrão.');
                    dadosCurriculo['foto_url'] = 'assets/default-avatar.jpg';
                }
                previewImg.src = dadosCurriculo['foto_url'];
                previewImgWrapper.style.display = 'flex';
                previewImg.style.display = 'block';

                uploadBtn.style.display = "none";
                uploadSuccess.style.display = "flex";
                uploadSuccess.innerHTML = `<span class="success-upload"><span class="success-icon">✅</span> Foto enviada!</span>`;

                setTimeout(() => {
                    indexPergunta += 2;
                    fazerPergunta();
                }, 1200);
            })
            .catch(() => {
                alert('Erro ao enviar a foto. Usando avatar padrão.');
                dadosCurriculo['foto_url'] = 'assets/default-avatar.jpg';
            });
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
                let fotoUrl = data.foto_url;
                if (!fotoUrl || data.privado) {
                    adicionarMensagem('bot', '❌ Não foi possível baixar a foto (perfil privado ou não encontrado). Por favor, envie a foto do seu computador.');
                    mostrarInputUploadNoChat();
                    return;
                }
                dadosCurriculo.foto_url = fotoUrl;
                localStorage.setItem('dadosCurriculo', JSON.stringify(dadosCurriculo));
                gerarCurriculoPreview(dadosCurriculo);
                const previewImgTag = document.querySelector('.w3-display-container img');
                if (previewImgTag && fotoUrl) {
                    previewImgTag.src = fotoUrl;
                }
                window.dadosCurriculo = dadosCurriculo;
                adicionarMensagem('bot', '📥 Foto de perfil encontrada!');
                indexPergunta++;
                fazerPergunta();
            })
            .catch(err => {
                adicionarMensagem('bot', '❌ Erro ao obter foto. Usando avatar padrão.');
                dadosCurriculo.foto_url = 'assets/default-avatar.jpg';
                gerarCurriculoPreview(dadosCurriculo);
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

    // Avatar fora do balão, estilo qikify Chatbot
    if (remetente === 'bot') {
        const avatar = document.createElement('img');
        avatar.className = 'chat-avatar bot-avatar';
        avatar.src = 'assets/bot-2.gif';
        avatar.alt = 'Bot';
        div.appendChild(avatar);
    }

    // Conteúdo da mensagem
    const content = document.createElement('span');
    if (
        remetente === 'bot' &&
        typeof texto === 'string' &&
        !texto.startsWith('<span class="success-upload">') &&
        texto.trim() !== perguntas[1].pergunta.trim()
    ) {
        content.innerHTML = '<span class="typing-dot">•</span><span class="typing-dot">•</span><span class="typing-dot">•</span>';
        div.appendChild(content);
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
        setTimeout(() => {
            let i = 0;
            content.innerHTML = '';
            function typeChar() {
                if (i < texto.length) {
                    content.innerHTML += texto[i] === '\n' ? '<br>' : texto[i];
                    i++;
                    chat.scrollTop = chat.scrollHeight;
                    setTimeout(typeChar, 12 + Math.random() * 30);
                } else {
                    if (texto === perguntas[1].pergunta) {
                        content.innerHTML = texto.replace(/\n/g, '<br>');
                    } else {
                        content.textContent = texto;
                    }
                }
            }
            typeChar();
        }, 500);
    } else if (texto.startsWith('<span class="success-upload">')) {
        content.innerHTML = texto;
        div.appendChild(content);
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    } else {
        if (texto === perguntas[1].pergunta) {
            content.innerHTML = texto.replace(/\n/g, '<br>');
        } else {
            content.textContent = texto;
        }
        div.appendChild(content);
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    // Avatar do usuário fora do balão, à direita
    if (remetente === 'user') {
        const avatar = document.createElement('img');
        avatar.className = 'chat-avatar user-avatar';
        avatar.src = 'assets/avatar-boy.png'; // personalize se quiser
        avatar.alt = 'Você';
        div.appendChild(avatar);
    }
}

// -------- PREVIEW DO CURRÍCULO --------
function gerarCurriculoPreview(dadosCurriculo) {
    let html = `
    <div class="w3-content w3-margin-top" style="max-width:1400px;">
      <div class="w3-row-padding">
        <div class="w3-third">
          <div class="w3-white w3-text-grey w3-card-4">
            <div class="w3-display-container">
              <img src="${dadosCurriculo.foto_url || 'assets/default-avatar.jpg'}" style="width:100%;object-fit:cover;min-height:180px;max-height:220px;" alt="Avatar">
              <div class="w3-display-bottomleft w3-container w3-text-white">
                <h2 class="nome-bg">${dadosCurriculo.nome || ''}</h2>
              </div>
            </div>
            <div class="w3-container">
              <p><i class="fa fa-briefcase fa-fw w3-margin-right w3-large w3-text-teal"></i>${dadosCurriculo.cargo || ''}</p>
              <p><i class="fa fa-envelope fa-fw w3-margin-right w3-large w3-text-teal"></i>${dadosCurriculo.email || ''}</p>
              <p><i class="fa fa-phone fa-fw w3-margin-right w3-large w3-text-teal"></i>${dadosCurriculo.telefone || ''}</p>
              <hr>
              <p class="w3-large"><b><i class="fa fa-asterisk fa-fw w3-margin-right w3-text-teal"></i>Hard Skills</b></p>
              <p>${dadosCurriculo.hard || ''}</p>
              <p class="w3-large"><b><i class="fa fa-user fa-fw w3-margin-right w3-large w3-text-teal"></i>Soft Skills</b></p>
              <p>${dadosCurriculo.soft || ''}</p>
              <p class="w3-large w3-text-theme"><b><i class="fa fa-globe fa-fw w3-margin-right w3-large w3-text-teal"></i>Idiomas</b></p>
              <p>${dadosCurriculo.idiomas || ''}</p>
              <br>
            </div>
          </div>
        </div>
        <div class="w3-twothird">
          <div class="w3-container w3-card w3-white w3-margin-bottom">
            <h2 class="w3-text-grey w3-padding-16">
              <i class="fa fa-suitcase fa-fw w3-margin-right w3-xxlarge w3-text-teal"></i>Experiência Profissional
            </h2>
            ${(dadosCurriculo.experiencias || '')
                .split(';')
                .filter(Boolean)
                .map(exp => `<div class="w3-container"><p>${exp.trim()}</p><hr></div>`).join('')}
          </div>
          <div class="w3-container w3-card w3-white">
            <h2 class="w3-text-grey w3-padding-16">
              <i class="fa fa-certificate fa-fw w3-margin-right w3-xxlarge w3-text-teal"></i>Formação
            </h2>
            ${(dadosCurriculo.formacoes || '')
                .split(';')
                .filter(Boolean)
                .map(form => `<div class="w3-container"><p>${form.trim()}</p><hr></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
    `;
    const container = document.getElementById('curriculo-container');
    if (container) {
        container.innerHTML = html;
        previewContainer.style.display = 'block';
        tituloCV.style.display = 'block';
        btnBaixarPDF.style.display = 'block';
    } else {
        console.error("Elemento 'curriculo-container' não encontrado!");
    }
}

async function baixarPDF() {
    if (!dadosCurriculo.foto_url || dadosCurriculo.foto_url === 'undefined') {
        dadosCurriculo.foto_url = 'assets/default-avatar.jpg';
    }
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCurriculo)
        });
        const contentType = response.headers.get('Content-Type');
        if (!response.ok || !contentType.includes('pdf')) {
            const text = await response.text();
            alert('Erro ao gerar PDF:\n' + text);
            return;
        }
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
    tituloCV.style.display = 'none';
    previewContainer.style.display = 'none';
    btnBaixarPDF.style.display = 'none';
    adicionarMensagem('bot', '🧠 Olá! Vamos começar novamente.');
    fazerPergunta();
}

function atualizarFotoPreview(caminhoFoto) {
  const img = document.querySelector('.w3-display-container img');
  if (img) img.src = caminhoFoto;
}
