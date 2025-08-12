// URL do Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxz01jl5lnynqOg-j_nvEmKTvA_v0mQ5ufMYhnhaiLa4nwLTXJ5eshVT6uyOr-YPhHI0g/exec';

let messages = [];

function renderMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';

    messages.forEach((msg, index) => {
        const row = document.createElement('div');
        row.className = 'sheet-row';
        row.innerHTML = `
            <div class="row-number">${index + 2}</div>
            <div class="sheet-cell nome">${msg.nome}</div>
            <div class="sheet-cell mensagem">${msg.mensagem}</div>
            <div class="sheet-cell enviar"></div>
        `;
        container.appendChild(row);
    });

    // Atualizar stats se existir
    const stats = document.getElementById('stats');
    if (stats) {
        stats.textContent = `📊 Total de mensagens: ${messages.length} | 💝 Pessoas que enviaram carinho para a Carol`;
    }
}

async function loadMessages() {
    try {
        const container = document.getElementById('messages-container');
        container.innerHTML = '<div class="loading"><div class="spinner"></div>Carregando mensagens...</div>';
        
        const response = await fetch(SCRIPT_URL);
        const result = await response.json();
        
        if (result.success) {
            messages = result.data;
            renderMessages();
        } else {
            throw new Error(result.error || 'Erro desconhecido');
        }
        
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        const container = document.getElementById('messages-container');
        container.innerHTML = '<div class="loading">❌ Erro ao carregar mensagens. Tente novamente.</div>';
    }
}

async function sendMessage() {
    const nome = document.getElementById('newName').value.trim();
    const mensagem = document.getElementById('newMessage').value.trim();
    
    if (!nome || !mensagem) {
        alert('Por favor, preencha seu nome e mensagem!');
        return;
    }
    
    // Desabilitar botão durante envio
    const sendBtn = document.querySelector('.send-btn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '⏳ Enviando...';
    sendBtn.disabled = true;
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, mensagem })
        });
        
        // Com no-cors, não podemos ler a resposta, então assumimos sucesso
        // Limpar inputs
        document.getElementById('newName').value = '';
        document.getElementById('newMessage').value = '';
        
        // Aguardar um pouco e recarregar mensagens
        setTimeout(async () => {
            await loadMessages();
        }, 1000);
        
        alert('🎉 Mensagem enviada com sucesso! Obrigado por participar do aniversário da Carol!');
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        
        // Mesmo com erro de CORS, a mensagem pode ter sido enviada
        // Vamos limpar os campos e recarregar
        document.getElementById('newName').value = '';
        document.getElementById('newMessage').value = '';
        
        setTimeout(async () => {
            await loadMessages();
        }, 1000);
        
        alert('🎉 Mensagem enviada! (Ignorando erro de CORS)');
    } finally {
        // Reabilitar botão
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    }
}

// Enter no textarea envia a mensagem
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('newMessage').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            sendMessage();
        }
    });

    // Carregar mensagens ao iniciar
    loadMessages();
});
