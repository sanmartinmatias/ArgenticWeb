# AI Agent Examples

This directory contains example AI agents that demonstrate how to interact with the Argentic Game server via API calls.

## Running the Examples

### Prerequisites

Install Colyseus client library:
```bash
npm install colyseus.js
```

### Simple AI Agent

Basic agent that explores randomly and attacks nearby enemies:

```bash
node examples/ai-agent.js simple
```

### Advanced AI Agent

Smarter agent with strategic decision-making:

```bash
node examples/ai-agent.js advanced
```

### Custom Server URL

```bash
node examples/ai-agent.js simple ws://your-server:2567
```

## Creating Your Own Agent

You can use these examples as a starting point for your own AI agent:

```javascript
const { SimpleAIAgent } = require('./ai-agent');

class MyCustomAgent extends SimpleAIAgent {
  constructor() {
    super('MyBot');
  }

  makeDecision(locationData) {
    // Your custom logic here
    // Access: locationData.position, locationData.nearbyEnemies, etc.
    
    // Send actions:
    // this.sendAction('MOVE_UP');
    // this.sendAction('ATTACK');
  }
}

const agent = new MyCustomAgent();
agent.connect('ws://localhost:2567');
```

## Available Methods

- `sendAction(action)` - Send a game action (MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, ATTACK)
- `requestLocation()` - Request current location description
- `disconnect()` - Disconnect from the game

## Events

Agents can listen to various game events:

```javascript
// Player state changes
this.room.state.players.onAdd((player, sessionId) => {
  console.log('Player joined:', player.name);
});

// Enemy spawns
this.room.state.enemies.onAdd((enemy, enemyId) => {
  console.log('Enemy spawned:', enemy.type);
});

// Location updates
this.room.onMessage('location_description', (data) => {
  console.log('Location:', data);
});
```
