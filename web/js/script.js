const API_URL = 'https://gerador-de-cv-ia-2-0.onrender.com/gerar-curriculo';

const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const previewContainer = document.getElementById('preview-container');

const dadosCurriculo = {
    nome: '',
    cargo: '',
    email: '',
    telefone: '',
    experiencias: '',
    formacoes: '',
    hard: '',
    soft: '',
    idiomas: '',
    foto_url: ''
};

const perguntas = [
    { chave: 'nome', pergunta: 'Qual seu nome completo?' },
    { chave: 'cargo', pergunta: 'Qual seu cargo ou profissão?' },
    { chave: 'email', pergunta: 'Qual seu email?' },
    { chave: 'telefone', pergunta: 'Qual seu telefone?' },
    { chave: 'foto_url', pergunta: 'Link da sua foto (URL direta da imagem)?' },
    { chave: 'experiencias', pergunta: 'Descreva suas experiências profissionais (use ponto e vírgula para separar cada experiência).' },
    { chave: 'formacoes', pergunta: 'Descreva sua formação acadêmica (use ponto e vírgula para separar cada formação).' },
    { chave: 'hard', pergunta: 'Quais são suas Hard Skills? (Separe por vírgula)' },
    { chave: 'soft', pergunta: 'Quais são suas Soft Skills? (Separe por vírgula)' },
    { chave: 'idiomas', pergunta: 'Quais idiomas você fala? (Separe por vírgula)' }
];

let indexPergunta = 0;

// 👉 Iniciar chat
window.onload = () => {
    adicionarMensagem('bot', '🧠 Olá! Sou o Gerador de Currículo IA. Bora começar seu currículo?');
    fazerPergunta();
};

function fazerPergunta() {
    if (indexPergunta < perguntas.length) {
        adicionarMensagem('bot', perguntas[indexPergunta].pergunta);
    } else {
        adicionarMensagem('bot', 'Perfeito! 🎯 Gerando a preview do seu currículo...');
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

    setTimeout(fazerPergunta, 400);
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
        if (item.trim()) {
            const li = document.createElement('li');
            li.innerText = item.trim();
            expList.appendChild(li);
        }
    });

    // Formações
    const formList = document.getElementById('form-placeholder');
    formList.innerHTML = '';
    dadosCurriculo.formacoes.split(';').forEach(item => {
        if (item.trim()) {
            const li = document.createElement('li');
            li.innerText = item.trim();
            formList.appendChild(li);
        }
    });
}

async function baixarPDF() {
    try {
        adicionarMensagem('bot', 'Gerando PDF... 🛠️');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCurriculo)
        });

        if (!response.ok) throw new Error('Erro ao gerar PDF');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `curriculo-${dadosCurriculo.nome}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
        adicionarMensagem('bot', '✔️ PDF gerado com sucesso!');

    } catch (error) {
        adicionarMensagem('bot', '❌ Erro ao gerar PDF. Verifique os dados e tente novamente.');
        console.error(error);
    }
}