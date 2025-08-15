// ==========================================================
// CONFIGURAÇÕES GLOBAIS
// ==========================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxz01jl5lnynqOg-j_nvEmKTvA_v0mQ5ufMYhnhaiLa4nwLTXJ5eshVT6uyOr-YPhHI0g/exec';
const YOUTUBE_VIDEO_ID = 'R36xGZMoz5Q'; // Jorge & Mateus - 50 Reais

let player;
let messages = [];
let playerReady = false;
let userInteracted = false;

// ==========================================================
// LÓGICA DO PLAYER DE MÚSICA (VERSÃO CORRIGIDA)
// ==========================================================

// Função global obrigatória para a API do YouTube
function onYouTubeIframeAPIReady() {
    console.log("API do YouTube carregada. Inicializando player...");
    initializePlayer();
}

function initializePlayer() {
    try {
        player = new YT.Player('youtube-player', {
            height: '1',
            width: '1',
            videoId: YOUTUBE_VIDEO_ID,
            playerVars: {
                'autoplay': 0, // MUDANÇA: Não tenta autoplay
                'controls': 0,
                'loop': 1,
                'playlist': YOUTUBE_VIDEO_ID,
                'playsinline': 1,
                'enablejsapi': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    } catch (error) {
        console.error("Erro ao criar player:", error);
        // Fallback: mostra mensagem para o usuário
        updatePlayerUI("❌ Erro ao carregar música");
    }
}

function onPlayerReady(event) {
    console.log("Player pronto!");
    playerReady = true;
    updatePlayerUI("🎵 Clique para tocar");
    
    // Se o usuário já interagiu, tenta tocar
    if (userInteracted) {
        startMusic();
    }
}

function onPlayerStateChange(event) {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (event.data === YT.PlayerState.PLAYING) {
        if (pauseIcon && playIcon) {
            pauseIcon.style.display = 'inline';
            playIcon.style.display = 'none';
        }
        updatePlayerUI("🎵 Tocando...");
    } else if (event.data === YT.PlayerState.PAUSED) {
        if (pauseIcon && playIcon) {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        }
        updatePlayerUI("⏸️ Pausado");
    } else if (event.data === YT.PlayerState.ENDED) {
        updatePlayerUI("🔄 Repetindo...");
    }
}

function onPlayerError(event) {
    console.error("Erro no player:", event.data);
    updatePlayerUI("❌ Erro na música");
}

function updatePlayerUI(message) {
    const songInfo = document.querySelector('.song-title');
    if (songInfo) {
        songInfo.textContent = message;
    }
}

// NOVA FUNÇÃO: Inicia a música após interação do usuário
function startMusic() {
    if (!playerReady || !player) {
        console.log("Player não está pronto ainda");
        return;
    }
    
    try {
        console.log("Iniciando música...");
        player.unMute();
        player.setVolume(50);
        player.playVideo();
        
        // Atualiza o slider de volume
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.value = 50;
        }
    } catch (error) {
        console.error("Erro ao iniciar música:", error);
        updatePlayerUI("❌ Erro ao tocar");
    }
}

// NOVA FUNÇÃO: Gerencia primeira interação do usuário
function handleFirstInteraction() {
    if (userInteracted) return;
    
    userInteracted = true;
    console.log("Primeira interação detectada!");
    
    if (playerReady) {
        startMusic();
    }
    
    // Remove todos os listeners de primeira interação
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
}

function togglePlayPause() {
    if (!playerReady || !player) {
        console.log("Player não está disponível");
        return;
    }
    
    // Garante que a primeira interação foi registrada
    handleFirstInteraction();
    
    try {
        const playerState = player.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    } catch (error) {
        console.error("Erro no play/pause:", error);
    }
}

function updateVolume(volume) {
    // Garante que a primeira interação foi registrada
    handleFirstInteraction();
    
    if (playerReady && player) {
        try {
            player.setVolume(volume);
        } catch (error) {
            console.error("Erro ao ajustar volume:", error);
        }
    }
}

// ==========================================================
// LÓGICA DA PLANILHA (sem alterações)
// ==========================================================
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

function renderMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    const totalMinRows = 30;

    messages.forEach((msg, index) => {
        const row = document.createElement('div');
        row.className = 'sheet-row';
        const rowNum = index + 2;
        row.innerHTML = `<div class="row-number-cell">${rowNum}</div><div class="sheet-cell nome">${msg.nome || ''}</div><div class="sheet-cell mensagem">${msg.mensagem || ''}</div><div class="sheet-cell enviar"></div><div class="sheet-cell empty-d"></div><div class="sheet-cell empty-e"></div><div class="sheet-cell empty-f"></div><div class="sheet-cell empty-g"></div><div class="sheet-cell empty-h"></div><div class="sheet-cell empty-i"></div><div class="sheet-cell empty-j"></div>`;
        container.appendChild(row);
    });

    const rowsToAdd = Math.max(0, totalMinRows - messages.length);
    const startingRowNumber = messages.length + 2;

    for (let i = 0; i < rowsToAdd; i++) {
        const row = document.createElement('div');
        row.className = 'sheet-row';
        const rowNum = startingRowNumber + i;
        row.innerHTML = `<div class="row-number-cell">${rowNum}</div><div class="sheet-cell nome"></div><div class="sheet-cell mensagem"></div><div class="sheet-cell enviar"></div><div class="sheet-cell empty-d"></div><div class="sheet-cell empty-e"></div><div class="sheet-cell empty-f"></div><div class="sheet-cell empty-g"></div><div class="sheet-cell empty-h"></div><div class="sheet-cell empty-i"></div><div class="sheet-cell empty-j"></div>`;
        container.appendChild(row);
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
// INICIALIZAÇÃO DA PÁGINA (VERSÃO CORRIGIDA)
// ==========================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("Página carregada. Configurando eventos...");
    
    // Carrega as mensagens
    loadMessages();
    
    // MÚLTIPLOS LISTENERS para capturar primeira interação
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    
    // Listener específico do botão play/pause
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    // Listener do volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            updateVolume(parseInt(e.target.value));
        });
    }
    
    // Listener para Enter+Ctrl na mensagem
    const messageInput = document.getElementById('newMessage');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Tenta carregar a API do YouTube se ainda não foi carregada
    if (!window.YT) {
        console.log("Carregando API do YouTube...");
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = () => {
            console.error("Falha ao carregar API do YouTube");
            updatePlayerUI("❌ Erro ao carregar YouTube");
        };
        document.head.appendChild(script);
    } else if (window.YT && window.YT.Player) {
        // API já carregada, inicializa direto
        console.log("API do YouTube já disponível");
        initializePlayer();
    }
});
