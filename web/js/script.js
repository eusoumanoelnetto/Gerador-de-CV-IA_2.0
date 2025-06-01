const API_URL = 'https://cv-api.onrender.com/gerar-curriculo';

try {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
    });

    if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `curriculo-${dados.nome}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
} catch (error) {
    alert("❌ Erro ao gerar currículo: " + error.message);
}