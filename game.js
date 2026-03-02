class Game {
  constructor(gameId) {
    this.gameId = gameId;
    this.players = [];
    this.currentTurn = 0;
    this.gameState = 'waiting'; // waiting, playing, finished
    this.board = this.initializeBoard();
    this.maxPlayers = 4;
    this.winningScore = 10;
  }

  initializeBoard() {
    // Create a simple 5x5 grid with resources
    const board = [];
    for (let i = 0; i < 5; i++) {
      board[i] = [];
      for (let j = 0; j < 5; j++) {
        board[i][j] = {
          resources: Math.floor(Math.random() * 3), // 0-2 resources per cell
          occupiedBy: null
        };
      }
    }
    return board;
  }

  addPlayer(playerId, playerName, isAI = false) {
    if (this.players.length >= this.maxPlayers) {
      return { success: false, message: 'Game is full' };
    }

    const startPositions = [
      { x: 0, y: 0 },
      { x: 4, y: 4 },
      { x: 0, y: 4 },
      { x: 4, y: 0 }
    ];

    const position = startPositions[this.players.length];
    
    const player = {
      id: playerId,
      name: playerName,
      isAI: isAI,
      score: 0,
      position: position,
      color: this.getPlayerColor(this.players.length)
    };

    this.players.push(player);
    this.board[position.y][position.x].occupiedBy = playerId;

    return { success: true, player: player };
  }

  getPlayerColor(index) {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
    return colors[index];
  }

  startGame() {
    if (this.players.length < 2) {
      return { success: false, message: 'Need at least 2 players' };
    }

    this.gameState = 'playing';
    return { success: true, message: 'Game started!' };
  }

  getCurrentPlayer() {
    return this.players[this.currentTurn % this.players.length];
  }

  makeMove(playerId, direction) {
    if (this.gameState !== 'playing') {
      return { success: false, message: 'Game is not in progress' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return { success: false, message: 'Not your turn' };
    }

    const newPosition = this.calculateNewPosition(currentPlayer.position, direction);
    
    if (!this.isValidPosition(newPosition)) {
      return { success: false, message: 'Invalid move' };
    }

    // Clear old position
    this.board[currentPlayer.position.y][currentPlayer.position.x].occupiedBy = null;

    // Update to new position
    currentPlayer.position = newPosition;
    const cell = this.board[newPosition.y][newPosition.x];
    
    // Collect resources
    if (cell.resources > 0) {
      currentPlayer.score += cell.resources;
      cell.resources = 0;
    }

    cell.occupiedBy = playerId;

    // Check for winner
    if (currentPlayer.score >= this.winningScore) {
      this.gameState = 'finished';
      return { 
        success: true, 
        message: 'Move successful', 
        winner: currentPlayer,
        gameOver: true 
      };
    }

    // Move to next turn
    this.currentTurn++;

    return { success: true, message: 'Move successful', gameOver: false };
  }

  calculateNewPosition(currentPos, direction) {
    const moves = {
      'up': { x: 0, y: -1 },
      'down': { x: 0, y: 1 },
      'left': { x: -1, y: 0 },
      'right': { x: 1, y: 0 }
    };

    const move = moves[direction];
    return {
      x: currentPos.x + move.x,
      y: currentPos.y + move.y
    };
  }

  isValidPosition(pos) {
    return pos.x >= 0 && pos.x < 5 && pos.y >= 0 && pos.y < 5;
  }

  getGameState() {
    return {
      gameId: this.gameId,
      players: this.players,
      board: this.board,
      currentTurn: this.currentTurn,
      currentPlayer: this.getCurrentPlayer(),
      gameState: this.gameState
    };
  }

  // AI Agent Logic
  getAIMove(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;

    const currentPos = player.position;
    const possibleMoves = ['up', 'down', 'left', 'right'];
    const validMoves = [];

    for (const direction of possibleMoves) {
      const newPos = this.calculateNewPosition(currentPos, direction);
      if (this.isValidPosition(newPos)) {
        const cell = this.board[newPos.y][newPos.x];
        validMoves.push({
          direction: direction,
          resources: cell.resources,
          position: newPos
        });
      }
    }

    if (validMoves.length === 0) return null;

    // AI Strategy: Prioritize cells with resources, otherwise move randomly
    validMoves.sort((a, b) => b.resources - a.resources);
    
    // Add some randomness to make it less predictable
    if (Math.random() > 0.3 && validMoves[0].resources > 0) {
      return validMoves[0].direction;
    } else {
      return validMoves[Math.floor(Math.random() * validMoves.length)].direction;
    }
  }
}

module.exports = Game;
