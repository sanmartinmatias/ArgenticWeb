# Argentic Game - Online Multiplayer Game

An online multiplayer game where both human players and AI agents can play together. Players use a visual interface with keyboard controls, while AI agents interact through WebSocket API calls.

## Features

- **Human Player Interface**: Visual game with keyboard controls
- **AI Agent API**: WebSocket-based API for programmatic gameplay
- **Real-time Multiplayer**: Powered by Colyseus for state synchronization
- **API Call Display**: See what API calls each keypress makes
- **Location Description**: Get detailed information about your current position

## Architecture

```
/ArgenticWeb
├── /client             # Frontend (Vite + TypeScript + Phaser)
│   ├── /src
│   │   ├── /entities   # Player.ts, Enemy.ts
│   │   ├── /scenes     # MainMenu.ts, GameScene.ts
│   │   ├── /systems    # InputHandler.ts
│   │   └── main.ts
│   └── package.json
├── /server             # Backend (Node.js + TypeScript + Colyseus)
│   ├── /src
│   │   ├── /rooms      # GameRoom.ts, GameRoomState.ts
│   │   └── index.ts
│   └── package.json
├── /shared             # Shared TypeScript Interfaces
│   └── /src
│       └── index.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sanmartinmatias/ArgenticWeb.git
cd ArgenticWeb
```

2. Install dependencies:
```bash
npm install
```

This will install dependencies for all workspaces (client, server, shared).

### Running the Game

#### Development Mode

Start both server and client in development mode:
```bash
npm run dev
```

This will start:
- Server at http://localhost:2567
- Client at http://localhost:3000

#### Production Mode

Build and run:
```bash
npm run build
npm run start:server
# In another terminal:
npm run start:client
```

## Playing the Game

### Human Players

1. Open http://localhost:3000 in your browser
2. Click "Start Game" to join
3. Use controls to play:
   - **Arrow Keys** or **WASD**: Move your character
   - **Space**: Attack nearby enemies
   - **L**: Get location description

### AI Agents

AI agents can connect via WebSocket and send commands programmatically.

#### Connection

```javascript
import { Client } from 'colyseus.js';

const client = new Client('ws://localhost:2567');
const room = await client.joinOrCreate('game', {
  name: 'AI_Agent_1',
  isAI: true
});
```

#### Available Actions

Send input messages to control the agent:

```javascript
// Move up
room.send('input', { action: 'MOVE_UP' });

// Move down
room.send('input', { action: 'MOVE_DOWN' });

// Move left
room.send('input', { action: 'MOVE_LEFT' });

// Move right
room.send('input', { action: 'MOVE_RIGHT' });

// Attack
room.send('input', { action: 'ATTACK' });
```

#### Get Location Description

```javascript
// Request location info
room.send('get_description');

// Listen for response
room.onMessage('location_description', (data) => {
  console.log('Position:', data.position);
  console.log('Terrain:', data.terrain);
  console.log('Nearby players:', data.nearbyPlayers);
  console.log('Nearby enemies:', data.nearbyEnemies);
  console.log('Health:', data.health);
  console.log('Score:', data.score);
});
```

#### Listen to Game State

```javascript
// Listen for player additions
room.state.players.onAdd((player, sessionId) => {
  console.log('Player joined:', player.name);
  
  // Track position changes
  player.position.onChange(() => {
    console.log('Player moved to:', player.position.x, player.position.y);
  });
});

// Listen for enemy additions
room.state.enemies.onAdd((enemy, enemyId) => {
  console.log('Enemy spawned:', enemy.type);
});
```

## API Documentation

### REST Endpoints

- `GET /api/health` - Check server health
- `GET /api/rooms` - List available game rooms
- `GET /api/docs` - API documentation

### WebSocket Messages

#### Client → Server

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `input` | `{ action: InputAction }` | Send player input |
| `ai_action` | `{ action: InputAction }` | AI agent action (same as input) |
| `get_description` | - | Request location description |

#### Server → Client

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `welcome` | Welcome data with API info | Sent on join |
| `location_description` | Location data | Response to get_description |

### Input Actions

- `MOVE_UP` - Move character up
- `MOVE_DOWN` - Move character down
- `MOVE_LEFT` - Move character left
- `MOVE_RIGHT` - Move character right
- `ATTACK` - Attack nearby enemies
- `GET_DESCRIPTION` - Get location info (triggered by 'L' key)

## Example AI Agent

```javascript
import { Client } from 'colyseus.js';

async function runAIAgent() {
  const client = new Client('ws://localhost:2567');
  const room = await client.joinOrCreate('game', {
    name: 'SmartBot',
    isAI: true
  });

  console.log('AI Agent connected:', room.sessionId);

  // Get initial location
  room.send('get_description');

  // Listen for location updates
  room.onMessage('location_description', (data) => {
    console.log('Current location:', data);
    
    // Simple AI: move towards nearest enemy
    if (data.nearbyEnemies.length > 0) {
      const enemy = data.nearbyEnemies[0];
      if (enemy.distance < 30) {
        // Close enough to attack
        room.send('input', { action: 'ATTACK' });
      } else {
        // Move closer (simplified logic)
        room.send('input', { action: 'MOVE_RIGHT' });
      }
    } else {
      // Explore randomly
      const actions = ['MOVE_UP', 'MOVE_DOWN', 'MOVE_LEFT', 'MOVE_RIGHT'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      room.send('input', { action: randomAction });
    }
    
    // Check location again after 1 second
    setTimeout(() => room.send('get_description'), 1000);
  });
}

runAIAgent().catch(console.error);
```

## Game Mechanics

- **World Size**: 800x600 units
- **Player Health**: 100 HP
- **Movement Speed**: 5 units per action
- **Attack Range**: 30 units
- **Attack Damage**: 25 HP
- **Score**: +10 points per enemy defeated

## Terrain Types

The game world has different terrain types based on position:
- **Forest**: Northwest (x<200, y<200)
- **Mountains**: Northeast (x>600, y<200)
- **Swamp**: Southwest (x<200, y>400)
- **Desert**: Southeast (x>600, y>400)
- **Plains**: Central area

## Development

### Project Structure

- **shared/**: Common TypeScript types and interfaces
- **server/**: Colyseus game server
  - `rooms/GameRoom.ts`: Game logic and state management
  - `rooms/GameRoomState.ts`: Colyseus schema for state sync
- **client/**: Phaser game client
  - `entities/`: Player and Enemy classes
  - `scenes/`: MainMenu and GameScene
  - `systems/`: Input handling

### Tech Stack

- **Frontend**: Vite, TypeScript, Phaser 3
- **Backend**: Node.js, TypeScript, Colyseus, Express
- **Real-time**: WebSocket (via Colyseus)

## Monitoring

Access the Colyseus monitor panel at:
http://localhost:2567/colyseus

This shows:
- Active rooms
- Connected players
- Room state

## Troubleshooting

### Server won't start
- Check if port 2567 is available
- Ensure dependencies are installed: `npm install`

### Client can't connect
- Make sure server is running
- Check server URL in client (default: ws://localhost:2567)
- Check browser console for errors

### API calls not working
- Verify WebSocket connection is established
- Check message format matches documentation
- Use browser DevTools to inspect network traffic

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT
