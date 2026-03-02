const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// In-memory game storage
const games = new Map();
const playerSockets = new Map();

// Generate unique game ID
function generateGameId() {
  return 'game-' + Math.random().toString(36).substr(2, 9);
}

// Generate unique player ID
function generatePlayerId() {
  return 'player-' + Math.random().toString(36).substr(2, 9);
}

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Create or join a game
  socket.on('createGame', (data) => {
    const gameId = generateGameId();
    const playerId = generatePlayerId();
    const game = new Game(gameId);
    
    const result = game.addPlayer(playerId, data.playerName || 'Player 1', false);
    
    if (result.success) {
      games.set(gameId, game);
      playerSockets.set(socket.id, { gameId, playerId });
      socket.join(gameId);
      
      socket.emit('gameCreated', {
        gameId: gameId,
        playerId: playerId,
        player: result.player
      });

      socket.emit('gameState', game.getGameState());
    }
  });

  socket.on('joinGame', (data) => {
    const game = games.get(data.gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const playerId = generatePlayerId();
    const result = game.addPlayer(playerId, data.playerName || 'Player', false);
    
    if (result.success) {
      playerSockets.set(socket.id, { gameId: data.gameId, playerId });
      socket.join(data.gameId);
      
      socket.emit('gameJoined', {
        gameId: data.gameId,
        playerId: playerId,
        player: result.player
      });

      // Broadcast to all players in the game
      io.to(data.gameId).emit('gameState', game.getGameState());
    } else {
      socket.emit('error', { message: result.message });
    }
  });

  socket.on('addAIPlayer', () => {
    const playerInfo = playerSockets.get(socket.id);
    if (!playerInfo) return;

    const game = games.get(playerInfo.gameId);
    if (!game) return;

    const aiId = generatePlayerId();
    const aiNames = ['AI Agent Alpha', 'AI Agent Beta', 'AI Agent Gamma', 'AI Agent Delta'];
    const aiName = aiNames[game.players.filter(p => p.isAI).length];
    
    const result = game.addPlayer(aiId, aiName, true);
    
    if (result.success) {
      io.to(playerInfo.gameId).emit('gameState', game.getGameState());
      socket.emit('message', { text: `${aiName} joined the game!` });
    }
  });

  socket.on('startGame', () => {
    const playerInfo = playerSockets.get(socket.id);
    if (!playerInfo) return;

    const game = games.get(playerInfo.gameId);
    if (!game) return;

    const result = game.startGame();
    
    if (result.success) {
      io.to(playerInfo.gameId).emit('gameState', game.getGameState());
      io.to(playerInfo.gameId).emit('message', { text: 'Game started!' });
      
      // If current player is AI, make their move
      processAITurn(game, playerInfo.gameId);
    } else {
      socket.emit('error', { message: result.message });
    }
  });

  socket.on('makeMove', (data) => {
    const playerInfo = playerSockets.get(socket.id);
    if (!playerInfo) return;

    const game = games.get(playerInfo.gameId);
    if (!game) return;

    const result = game.makeMove(playerInfo.playerId, data.direction);
    
    if (result.success) {
      io.to(playerInfo.gameId).emit('gameState', game.getGameState());
      
      if (result.gameOver) {
        io.to(playerInfo.gameId).emit('gameOver', {
          winner: result.winner
        });
      } else {
        // Process AI turn if next player is AI
        setTimeout(() => {
          processAITurn(game, playerInfo.gameId);
        }, 500);
      }
    } else {
      socket.emit('error', { message: result.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    playerSockets.delete(socket.id);
  });
});

// Process AI player turn
function processAITurn(game, gameId) {
  if (game.gameState !== 'playing') return;

  const currentPlayer = game.getCurrentPlayer();
  
  if (currentPlayer.isAI) {
    const aiMove = game.getAIMove(currentPlayer.id);
    
    if (aiMove) {
      setTimeout(() => {
        const result = game.makeMove(currentPlayer.id, aiMove);
        
        if (result.success) {
          io.to(gameId).emit('gameState', game.getGameState());
          
          if (result.gameOver) {
            io.to(gameId).emit('gameOver', {
              winner: result.winner
            });
          } else {
            // Continue processing AI turns if next player is also AI
            processAITurn(game, gameId);
          }
        }
      }, 1000); // AI takes 1 second to "think"
    }
  }
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to play`);
});
