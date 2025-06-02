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

const perguntas = [
    { chave: 'nome', pergunta: '🧠 Qual seu nome completo?' },
    { chave: 'foto_url', pergunta: '🖼️ Cole o link da sua foto (URL direta, Instagram, LinkedIn ou Facebook).' },
    { chave: 'cargo', pergunta: '💼 Qual seu cargo ou profissão?' },
    { chave: 'email', pergunta: '📧 Informe seu e-mail.' },
    { chave: 'telefone', pergunta: '📱 Informe seu telefone.' },
    { chave: 'experiencias', pergunta: '🛠️ Descreva suas experiências profissionais. (Ex: Cargo | Empresa | Período | Descrição). Separe cada uma com ponto e vírgula.' },
    { chave: 'formacoes', pergunta: '🎓 Descreva sua formação acadêmica. (Ex: Curso | Instituição | Período). Separe cada uma com ponto e vírgula.' },
    { chave: 'hard', pergunta: '🧠 Liste suas Hard Skills (ex.: Python, SQL, IA, etc). Separe por vírgula.' },
    { chave: 'soft', pergunta: '💡 Liste suas Soft Skills (ex.: Resiliência, Comunicação, Liderança). Separe por vírgula.' },
    { chave: 'idiomas', pergunta: '🌍 Quais idiomas você fala? (Separe por vírgula)' }
];

let indexPergunta = 0;

// Iniciar o chat
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

function handleUserInput() {
    const input = userInput.value.trim();
    if (!input) return;

    adicionarMensagem('user', input);
    const chaveAtual = perguntas[indexPergunta].chave;
    dadosCurriculo[chaveAtual] = input;

    userInput.value = '';
    indexPergunta++;

    setTimeout(fazerPergunta, 500);
}

function adicionarMensagem(remetente, texto) {
    const div = document.createElement('div');
    div.classList.add('message', remetente);
    div.innerText = texto;
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

    // Experiências
    const expList = document.getElementById('exp-placeholder');
    expList.innerHTML = '';
    dadosCurriculo.experiencias.split(';').forEach(item => {
        const li = document.createElement('li');
        li.innerText = item.trim();
        expList.appendChild(li);
    });

    // Formações
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

        if (!response.ok) throw new Error('Erro ao gerar PDF.');

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