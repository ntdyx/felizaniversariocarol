// ==========================================================
// CONFIGURAÇÕES
// ==========================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxz01jl5lnynqOg-j_nvEmKTvA_v0mQ5ufMYhnhaiLa4nwLTXJ5eshVT6uyOr-YPhHI0g/exec';
const YOUTUBE_VIDEO_ID = 'fN24-3r8-4s'; // Jesse McCartney - Just So You Know

let messages = [];
let player; // Variável global para o player do YouTube

// ==========================================================
// LÓGICA DO PLAYER DE MÚSICA
// ==========================================================

// 1. Função chamada pela API do YouTube assim que ela é carregada
function onYouTubeIframeAPIReady() {
    // Cria o player de vídeo
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
            'autoplay': 1,       // Tenta dar autoplay. Se falhar, o usuário clica.
            'controls': 0,       // Esconde os controles nativos do YouTube
            'loop': 1,           // Toca em loop
            'playlist': YOUTUBE_VIDEO_ID // Essencial para o loop funcionar
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 2. Função executada quando o player está pronto para tocar
function onPlayerReady(event) {
    // Define o volume inicial com base no slider
    const volumeSlider = document.getElementById('volumeSlider');
    player.setVolume(volumeSlider.value);
    
    // Tenta tocar o vídeo. A maioria dos navegadores modernos vai bloquear isso
    // até que o usuário clique em algum lugar da página.
    event.target.playVideo();
}

// 3. Função que atualiza o ícone de play/pause
function onPlayerStateChange(event) {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');

    if (event.data === YT.PlayerState.PLAYING) {
        // Se a música está tocando, mostramos o ícone de PAUSE
        pauseIcon.style.display = 'inline';
        playIcon.style.display = 'none';
    } else {
        // Se estiver pausada, em buffer, ou parada, mostramos o ícone de PLAY
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
    }
}

// 4. Função para o nosso botão de Play/Pause
function togglePlayPause() {
    // Verifica se o player existe e está funcionando
    if (player && typeof player.getPlayerState === 'function') {
        const playerState = player.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            // Este comando, vindo de um clique do usuário, SEMPRE funciona
            player.playVideo();
        }
    }
}

// ==========================================================
// LÓGICA DA PLANILHA
// ==========================================================

function renderMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    const totalMinRows = 50;

    messages.forEach((msg, index) => {
        const row = document.createElement('div');
        row.className = 'sheet-row';
        const rowNum = index + 2;
        row.innerHTML = `
            <div class="row-number-cell">${rowNum}</div>
            <div class="sheet-cell nome">${msg.nome || ''}</div>
            <div class="sheet-cell mensagem">${msg.mensagem || ''}</div>
            <div class="sheet-cell enviar"></div>
            <div class="sheet-cell empty"></div>
            <div class="sheet-cell empty"></div>
            <div class="sheet-cell empty"></div>
            <div class="sheet-cell empty"></div>
            <div class="sheet-cell empty"></div>
        `;
        container.appendChild(row);
    });

    const rowsToAdd = Math.max(0, totalMinRows - messages.length);
    const startingRowNumber = messages.length + 2;

    for (let i = 0; i < rowsToAdd; i++) {
        const row = document.createElement('div');
        row.className = 'sheet-row';
        const rowNum = startingRowNumber + i;
        row.innerHTML = `
            <div class="row-number-cell">${rowNum}</div>
            <div class="sheet-cell nome"></div>
            <div class="sheet-cell mensagem"></div>
            <div class="sheet-cell enviar"></div>
            <div class="sheet-cell empty"></div>
            <div class="sheet-cell empty"></div>
            <div class="sheet-cell empty"></div>
            <div class="sheet-cell empty"></div>
            <div class="sheet-cell empty"></div>
        `;
        container.appendChild(row);
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
        document.getElementById('messages-container').innerHTML = '<div class="loading">❌ Erro ao carregar mensagens. Tente novamente.</div>';
    }
}

async function sendMessage() {
    const nome = document.getElementById('newName').value.trim();
    const mensagem = document.getElementById('newMessage').value.trim();
    if (!nome || !mensagem) {
        alert('Por favor, preencha seu nome e mensagem!');
        return;
    }
    const sendBtn = document.querySelector('.send-btn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '⏳ Enviando...';
    sendBtn.disabled = true;
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, mensagem })
        });
        document.getElementById('newName').value = '';
        document.getElementById('newMessage').value = '';
        setTimeout(loadMessages, 1000);
        alert('🎉 Mensagem enviada com sucesso! Obrigado por participar do aniversário da Carol!');
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        document.getElementById('newName').value = '';
        document.getElementById('newMessage').value = '';
        setTimeout(loadMessages, 1000);
        alert('🎉 Mensagem enviada! (Ignorando erro de CORS)');
    } finally {
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    }
}

// ==========================================================
// INICIALIZAÇÃO DA PÁGINA
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {
    // Carrega as mensagens da planilha
    loadMessages();

    // Adiciona funcionalidade de enviar com Ctrl+Enter
    document.getElementById('newMessage').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Conecta os controles do Player de Música
    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
    
    document.getElementById('volumeSlider').addEventListener('input', () => {
        if (player && typeof player.setVolume === 'function') {
            player.setVolume(volumeSlider.value);
        }
    });
});
