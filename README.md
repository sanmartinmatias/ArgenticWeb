# ArgenticWeb 🎮

An online multiplayer game about AI and human players

## Overview

ArgenticWeb is a turn-based strategy game where human players compete against AI agents (Agentic Players) to collect resources on a grid-based board. The game demonstrates the interaction between human creativity and AI computational strategies in a fun, competitive environment.

## Features

- 🧑 **Human Players**: Join games and compete using strategy and intuition
- 🤖 **AI Agents**: Intelligent bot players with resource-seeking strategies
- 🌐 **Multiplayer**: Support for up to 4 players (human and AI combined)
- 💎 **Resource Collection**: First player to reach 10 points wins
- ⚡ **Real-time Updates**: WebSocket-based live game synchronization
- 🎨 **Beautiful UI**: Clean, modern interface with gradient backgrounds

## Game Rules

1. Players start in different corners of a 5x5 grid
2. Take turns moving up, down, left, or right
3. Collect diamond resources (💎) by moving onto cells containing them
4. Each diamond is worth 1-2 points
5. First player to reach 10 points wins!

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/sanmartinmatias/ArgenticWeb.git
cd ArgenticWeb
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

### Starting a Game

1. Enter your player name
2. Click **"Create New Game"** to start a new game
3. Share the generated Game ID with friends, or add AI players
4. Click **"Add AI Player"** to add computer opponents
5. Click **"Start Game"** when ready (minimum 2 players required)

### Joining a Game

1. Enter your player name
2. Enter the Game ID shared by the host
3. Click **"Join Game"**
4. Wait for the host to start the game

### Controls

- **Arrow Keys**: Move your player (↑ ↓ ← →)
- **Control Buttons**: Click the on-screen buttons to move
- Players can only move on their turn

### Player Types

- **👤 Human Players**: Controlled by real players
- **🤖 AI Agents**: Automated players with intelligent strategies
  - AI Agent Alpha
  - AI Agent Beta
  - AI Agent Gamma
  - AI Agent Delta

## Technology Stack

- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.io
- **Frontend**: Vanilla JavaScript, HTML5 Canvas
- **Styling**: CSS3 with gradients and animations

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Project Structure

```
ArgenticWeb/
├── server.js           # Express server and Socket.io logic
├── game.js            # Game logic and AI agent strategies
├── package.json       # Dependencies and scripts
└── public/
    ├── index.html     # Main HTML file
    ├── style.css      # Styling
    └── game.js        # Client-side game logic
```

## AI Strategy

The AI agents use a resource-prioritizing strategy:
- Scan all valid moves
- Prioritize cells with resources
- Add randomness (30% chance) to avoid predictability
- Make strategic decisions within 1 second "thinking" time

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Screenshots

### Main Menu
![Menu Screen](https://github.com/user-attachments/assets/9e4cc521-c625-4c61-9684-9ba737bcc03b)

### Game Lobby
![Lobby Screen](https://github.com/user-attachments/assets/5aa3d106-0aa7-4427-9c17-eef219267e55)

### Game Board
![Game Board](https://github.com/user-attachments/assets/36f5ad37-9158-4fa2-9d48-89043b0ba545)

### Gameplay
![Game in Progress](https://github.com/user-attachments/assets/17c6b569-beee-4116-8151-31f38e2542c8)
