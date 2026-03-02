/**
 * Example AI Agent for Argentic Game
 * 
 * This demonstrates how to create an AI agent that can play the game
 * via WebSocket API calls.
 * 
 * To run:
 * 1. Make sure the server is running (npm run dev in root)
 * 2. Install dependencies: npm install colyseus.js
 * 3. Run: node examples/ai-agent.js
 */

const { Client } = require('colyseus.js');

class SimpleAIAgent {
  constructor(name = 'SimpleBot') {
    this.name = name;
    this.client = null;
    this.room = null;
    this.playerId = null;
    this.currentPosition = { x: 0, y: 0 };
    this.isRunning = false;
  }

  async connect(serverUrl = 'ws://localhost:2567') {
    try {
      console.log(`🤖 ${this.name} connecting to ${serverUrl}...`);
      
      this.client = new Client(serverUrl);
      this.room = await this.client.joinOrCreate('game', {
        name: this.name,
        isAI: true
      });

      this.playerId = this.room.sessionId;
      console.log(`✅ Connected! Player ID: ${this.playerId}`);

      this.setupEventListeners();
      this.isRunning = true;
      
      // Start AI decision loop
      this.startDecisionLoop();
      
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      throw error;
    }
  }

  setupEventListeners() {
    // Welcome message
    this.room.onMessage('welcome', (message) => {
      console.log('📨 Welcome message:', message.message);
      console.log('📖 Available API calls:', message.apiCalls);
    });

    // Location description
    this.room.onMessage('location_description', (data) => {
      this.handleLocationUpdate(data);
    });

    // Track player state
    this.room.state.players.onAdd((player, sessionId) => {
      if (sessionId === this.playerId) {
        console.log(`👤 My player added: ${player.name}`);
        
        // Track position changes
        player.position.onChange(() => {
          this.currentPosition = { 
            x: player.position.x, 
            y: player.position.y 
          };
        });
        
        // Track health changes
        player.onChange = () => {
          if (player.health < 50) {
            console.log(`⚠️  Low health: ${player.health}/100`);
          }
        };
      } else {
        console.log(`👥 Other player joined: ${player.name}`);
      }
    });

    // Track enemies
    this.room.state.enemies.onAdd((enemy, enemyId) => {
      console.log(`👾 Enemy spawned: ${enemy.type} at (${enemy.position.x}, ${enemy.position.y})`);
    });

    this.room.state.enemies.onRemove(() => {
      console.log('💀 Enemy defeated!');
    });
  }

  handleLocationUpdate(data) {
    console.log('\n📍 Location Update:');
    console.log(`   Position: (${data.position.x}, ${data.position.y})`);
    console.log(`   Terrain: ${data.terrain}`);
    console.log(`   Health: ${data.health}/100`);
    console.log(`   Score: ${data.score}`);
    
    if (data.nearbyPlayers.length > 0) {
      console.log(`   👥 Nearby players: ${data.nearbyPlayers.length}`);
      data.nearbyPlayers.forEach(p => {
        console.log(`      - ${p.name} (distance: ${p.distance})`);
      });
    }
    
    if (data.nearbyEnemies.length > 0) {
      console.log(`   👾 Nearby enemies: ${data.nearbyEnemies.length}`);
      data.nearbyEnemies.forEach(e => {
        console.log(`      - ${e.type} (distance: ${e.distance})`);
      });
    }

    // Make decision based on location
    this.makeDecision(data);
  }

  makeDecision(locationData) {
    // Simple AI logic:
    // 1. If enemy is very close, attack
    // 2. If enemy is nearby, move towards it
    // 3. Otherwise, explore randomly

    if (locationData.nearbyEnemies.length > 0) {
      const closestEnemy = locationData.nearbyEnemies[0];
      
      if (closestEnemy.distance < 35) {
        console.log('⚔️  Attacking enemy!');
        this.sendAction('ATTACK');
      } else {
        console.log('🏃 Moving towards enemy...');
        // Simple movement towards enemy (could be improved)
        const actions = ['MOVE_UP', 'MOVE_DOWN', 'MOVE_LEFT', 'MOVE_RIGHT'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        this.sendAction(randomAction);
      }
    } else {
      // Explore randomly
      const actions = ['MOVE_UP', 'MOVE_DOWN', 'MOVE_LEFT', 'MOVE_RIGHT'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      console.log(`🔍 Exploring: ${randomAction}`);
      this.sendAction(randomAction);
    }
  }

  sendAction(action) {
    if (!this.room) return;
    
    console.log(`📤 Sending action: ${action}`);
    this.room.send('input', { action });
  }

  requestLocation() {
    if (!this.room) return;
    
    console.log('📍 Requesting location description...');
    this.room.send('get_description');
  }

  startDecisionLoop() {
    // Request location every 2 seconds to make decisions
    this.decisionInterval = setInterval(() => {
      if (this.isRunning) {
        this.requestLocation();
      }
    }, 2000);

    // Initial location request
    setTimeout(() => this.requestLocation(), 500);
  }

  disconnect() {
    console.log(`👋 ${this.name} disconnecting...`);
    this.isRunning = false;
    
    if (this.decisionInterval) {
      clearInterval(this.decisionInterval);
    }
    
    if (this.room) {
      this.room.leave();
    }
  }
}

// Advanced AI Agent with better strategy
class AdvancedAIAgent extends SimpleAIAgent {
  constructor(name = 'AdvancedBot') {
    super(name);
    this.enemyMemory = new Map(); // Remember enemy positions
    this.explorationTarget = null;
  }

  makeDecision(locationData) {
    // Update enemy memory
    locationData.nearbyEnemies.forEach(enemy => {
      this.enemyMemory.set(enemy.id, {
        type: enemy.type,
        distance: enemy.distance,
        lastSeen: Date.now()
      });
    });

    // Clean old memories (enemies not seen in 10 seconds)
    const now = Date.now();
    for (const [id, data] of this.enemyMemory) {
      if (now - data.lastSeen > 10000) {
        this.enemyMemory.delete(id);
      }
    }

    // Strategy:
    // 1. Attack if enemy is in range
    // 2. Retreat if health is low
    // 3. Hunt weak enemies first
    // 4. Explore systematically

    if (locationData.health < 30) {
      console.log('🏃 Health critical! Retreating...');
      this.retreat(locationData);
      return;
    }

    if (locationData.nearbyEnemies.length > 0) {
      // Sort by distance, prioritize basic enemies
      const enemies = locationData.nearbyEnemies.sort((a, b) => {
        if (a.type === 'basic' && b.type !== 'basic') return -1;
        if (a.type !== 'basic' && b.type === 'basic') return 1;
        return a.distance - b.distance;
      });

      const target = enemies[0];

      if (target.distance < 35) {
        console.log(`⚔️  Attacking ${target.type} enemy!`);
        this.sendAction('ATTACK');
      } else {
        console.log(`🎯 Hunting ${target.type} enemy (distance: ${target.distance})...`);
        // Move intelligently (this is still simplified)
        const actions = ['MOVE_UP', 'MOVE_DOWN', 'MOVE_LEFT', 'MOVE_RIGHT'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        this.sendAction(randomAction);
      }
    } else {
      this.explore(locationData);
    }
  }

  retreat(locationData) {
    // Move away from enemies and towards center
    const centerX = 400;
    const centerY = 300;
    
    if (locationData.position.x < centerX) {
      this.sendAction('MOVE_RIGHT');
    } else if (locationData.position.x > centerX) {
      this.sendAction('MOVE_LEFT');
    } else if (locationData.position.y < centerY) {
      this.sendAction('MOVE_DOWN');
    } else {
      this.sendAction('MOVE_UP');
    }
  }

  explore(locationData) {
    // Systematic exploration
    console.log('🗺️  Exploring map...');
    
    const { x, y } = locationData.position;
    
    // Move in a spiral pattern
    if (x < 200) {
      this.sendAction('MOVE_RIGHT');
    } else if (x > 600) {
      this.sendAction('MOVE_LEFT');
    } else if (y < 200) {
      this.sendAction('MOVE_DOWN');
    } else if (y > 400) {
      this.sendAction('MOVE_UP');
    } else {
      // Random movement in center
      const actions = ['MOVE_UP', 'MOVE_DOWN', 'MOVE_LEFT', 'MOVE_RIGHT'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      this.sendAction(randomAction);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const agentType = args[0] || 'simple';
  const serverUrl = args[1] || 'ws://localhost:2567';

  let agent;
  
  if (agentType === 'advanced') {
    agent = new AdvancedAIAgent('AdvancedBot');
  } else {
    agent = new SimpleAIAgent('SimpleBot');
  }

  try {
    await agent.connect(serverUrl);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down...');
      agent.disconnect();
      process.exit(0);
    });

    console.log('\n✨ AI Agent is running! Press Ctrl+C to stop.\n');
  } catch (error) {
    console.error('Failed to start agent:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SimpleAIAgent, AdvancedAIAgent };
