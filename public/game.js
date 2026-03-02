const socket = io();

let gameId = null;
let playerId = null;
let gameState = null;

// DOM elements
const menu = document.getElementById('menu');
const lobby = document.getElementById('lobby');
const game = document.getElementById('game');
const gameOver = document.getElementById('gameOver');

const playerNameInput = document.getElementById('playerName');
const gameIdInput = document.getElementById('gameIdInput');
const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const addAIBtn = document.getElementById('addAIBtn');
const startGameBtn = document.getElementById('startGameBtn');
const newGameBtn = document.getElementById('newGameBtn');

const lobbyGameId = document.getElementById('lobbyGameId');
const playersList = document.getElementById('playersList');
const currentTurn = document.getElementById('currentTurn');
const playersInfo = document.getElementById('playersInfo');
const messages = document.getElementById('messages');
const winnerText = document.getElementById('winnerText');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Control buttons
const moveUpBtn = document.getElementById('moveUp');
const moveDownBtn = document.getElementById('moveDown');
const moveLeftBtn = document.getElementById('moveLeft');
const moveRightBtn = document.getElementById('moveRight');

// Event listeners
createGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim() || 'Player 1';
    socket.emit('createGame', { playerName });
});

joinGameBtn.addEventListener('click', () => {
    const gameIdToJoin = gameIdInput.value.trim();
    const playerName = playerNameInput.value.trim() || 'Player';
    
    if (!gameIdToJoin) {
        addMessage('Please enter a Game ID', true);
        return;
    }
    
    socket.emit('joinGame', { gameId: gameIdToJoin, playerName });
});

addAIBtn.addEventListener('click', () => {
    socket.emit('addAIPlayer');
});

startGameBtn.addEventListener('click', () => {
    socket.emit('startGame');
});

newGameBtn.addEventListener('click', () => {
    location.reload();
});

// Move buttons
moveUpBtn.addEventListener('click', () => makeMove('up'));
moveDownBtn.addEventListener('click', () => makeMove('down'));
moveLeftBtn.addEventListener('click', () => makeMove('left'));
moveRightBtn.addEventListener('click', () => makeMove('right'));

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameState && gameState.gameState === 'playing') {
        const currentPlayer = gameState.currentPlayer;
        if (currentPlayer && currentPlayer.id === playerId && !currentPlayer.isAI) {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    makeMove('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    makeMove('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    makeMove('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    makeMove('right');
                    break;
            }
        }
    }
});

function makeMove(direction) {
    if (!gameState || gameState.gameState !== 'playing') return;
    
    const currentPlayer = gameState.currentPlayer;
    if (!currentPlayer || currentPlayer.id !== playerId || currentPlayer.isAI) {
        addMessage('Not your turn!', true);
        return;
    }
    
    socket.emit('makeMove', { direction });
}

// Socket event handlers
socket.on('gameCreated', (data) => {
    gameId = data.gameId;
    playerId = data.playerId;
    
    showLobby();
    lobbyGameId.textContent = gameId;
    addMessage(`Game created! Share this ID: ${gameId}`);
});

socket.on('gameJoined', (data) => {
    gameId = data.gameId;
    playerId = data.playerId;
    
    showLobby();
    lobbyGameId.textContent = gameId;
    addMessage('Joined game successfully!');
});

socket.on('gameState', (data) => {
    gameState = data;
    
    if (gameState.gameState === 'waiting') {
        updateLobby();
    } else if (gameState.gameState === 'playing') {
        showGame();
        updateGameDisplay();
    }
});

socket.on('gameOver', (data) => {
    showGameOver(data.winner);
});

socket.on('message', (data) => {
    addMessage(data.text);
});

socket.on('error', (data) => {
    addMessage(data.message, true);
});

// UI functions
function showLobby() {
    menu.classList.add('hidden');
    lobby.classList.remove('hidden');
    game.classList.add('hidden');
    gameOver.classList.add('hidden');
}

function showGame() {
    menu.classList.add('hidden');
    lobby.classList.add('hidden');
    game.classList.remove('hidden');
    gameOver.classList.add('hidden');
}

function showGameOver(winner) {
    gameOver.classList.remove('hidden');
    
    const isWinner = winner.id === playerId;
    winnerText.textContent = isWinner 
        ? `🎉 Congratulations! You won with ${winner.score} points!`
        : `${winner.name} won with ${winner.score} points!`;
}

function updateLobby() {
    if (!gameState) return;
    
    playersList.innerHTML = '';
    gameState.players.forEach(player => {
        const div = document.createElement('div');
        div.className = 'player-item';
        div.innerHTML = `
            <div class="player-color" style="background-color: ${player.color}"></div>
            <span>${player.name}</span>
            <span class="player-badge ${player.isAI ? 'ai' : 'human'}">
                ${player.isAI ? 'AI' : 'Human'}
            </span>
        `;
        playersList.appendChild(div);
    });
}

function updateGameDisplay() {
    if (!gameState) return;
    
    // Update current turn
    const current = gameState.currentPlayer;
    currentTurn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div class="player-color" style="background-color: ${current.color}; width: 30px; height: 30px;"></div>
            <span>${current.name} ${current.isAI ? '(AI)' : ''}</span>
        </div>
    `;
    
    // Update players info
    playersInfo.innerHTML = '';
    gameState.players.forEach(player => {
        const div = document.createElement('div');
        div.className = 'player-score';
        div.style.borderLeftColor = player.color;
        div.innerHTML = `
            <span>${player.name} ${player.isAI ? '🤖' : '👤'}</span>
            <strong>${player.score} pts</strong>
        `;
        playersInfo.appendChild(div);
    });
    
    // Draw board
    drawBoard();
}

function drawBoard() {
    if (!gameState) return;
    
    const cellSize = 100;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid and resources
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            const cell = gameState.board[y][x];
            
            // Draw cell background
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            
            // Draw cell border
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            
            // Draw resources
            if (cell.resources > 0) {
                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('💎'.repeat(cell.resources), x * cellSize + cellSize/2, y * cellSize + cellSize/2);
            }
        }
    }
    
    // Draw players
    gameState.players.forEach(player => {
        const x = player.position.x * cellSize + cellSize/2;
        const y = player.position.y * cellSize + cellSize/2;
        
        // Draw player circle
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw player icon
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.isAI ? '🤖' : '👤', x, y);
    });
}

function addMessage(text, isError = false) {
    const div = document.createElement('div');
    div.className = 'message' + (isError ? ' error' : '');
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
