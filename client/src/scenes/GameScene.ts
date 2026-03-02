import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { InputHandler } from '../systems/InputHandler';
import { InputAction } from '@argentic/shared';

export class GameScene extends Phaser.Scene {
  private client!: Client;
  private room!: Room;
  private players: Map<string, Player> = new Map();
  private enemies: Map<string, Enemy> = new Map();
  private inputHandler!: InputHandler;
  private localPlayerId: string = '';

  constructor() {
    super({ key: 'GameScene' });
  }

  async create() {
    // Create background grid
    this.createBackground();

    // Connect to server
    await this.connectToServer();

    // Setup input handling
    this.inputHandler = new InputHandler(this, (action) => this.handleInput(action));

    // Setup UI button handlers
    this.setupUIButtons();
  }

  private createBackground() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.3);
    
    // Draw grid
    for (let x = 0; x < 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
  }

  private async connectToServer() {
    try {
      const serverUrl = (import.meta as any).env?.VITE_SERVER_URL || 'ws://localhost:2567';
      this.client = new Client(serverUrl);
      
      this.updateStatus('Joining game room...');
      
      this.room = await this.client.joinOrCreate('game', {
        name: `Player_${Math.random().toString(36).substring(7)}`
      });

      this.localPlayerId = this.room.sessionId;
      this.updateStatus('Connected! You can play now.');

      // Listen for welcome message
      this.room.onMessage('welcome', (message) => {
        console.log('Welcome message:', message);
        this.updateStatus(`Welcome ${message.message}`);
      });

      // Listen for location descriptions
      this.room.onMessage('location_description', (data) => {
        this.updateLocationInfo(data);
      });

      // Listen for state changes
      this.room.state.players.onAdd((player: any, sessionId: string) => {
        this.addPlayer(sessionId, player);
      });

      this.room.state.players.onRemove((_player: any, sessionId: string) => {
        this.removePlayer(sessionId);
      });

      this.room.state.enemies.onAdd((enemy: any, enemyId: string) => {
        this.addEnemy(enemyId, enemy);
      });

      this.room.state.enemies.onRemove((_enemy: any, enemyId: string) => {
        this.removeEnemy(enemyId);
      });

    } catch (error) {
      console.error('Connection error:', error);
      this.updateStatus('Failed to connect to server. Is it running?');
    }
  }

  private addPlayer(sessionId: string, playerData: any) {
    const isLocal = sessionId === this.localPlayerId;
    const player = new Player(
      this,
      sessionId,
      playerData.name,
      playerData.position.x,
      playerData.position.y,
      isLocal
    );
    this.players.set(sessionId, player);

    // Listen for position changes
    playerData.position.onChange = () => {
      player.updatePosition(playerData.position.x, playerData.position.y);
    };

    // Listen for health changes
    playerData.onChange = () => {
      player.updateHealth(playerData.health);
    };
  }

  private removePlayer(sessionId: string) {
    const player = this.players.get(sessionId);
    if (player) {
      player.destroy();
      this.players.delete(sessionId);
    }
  }

  private addEnemy(enemyId: string, enemyData: any) {
    const enemy = new Enemy(
      this,
      enemyId,
      enemyData.type,
      enemyData.position.x,
      enemyData.position.y,
      enemyData.health
    );
    this.enemies.set(enemyId, enemy);

    // Listen for position changes
    enemyData.position.onChange = () => {
      enemy.updatePosition(enemyData.position.x, enemyData.position.y);
    };

    // Listen for health changes
    enemyData.onChange = () => {
      enemy.updateHealth(enemyData.health);
    };
  }

  private removeEnemy(enemyId: string) {
    const enemy = this.enemies.get(enemyId);
    if (enemy) {
      enemy.destroy();
      this.enemies.delete(enemyId);
    }
  }

  private handleInput(action: InputAction) {
    if (!this.room) return;

    // Send input to server
    this.room.send('input', { action });

    // Log API call
    this.logAPICall(action);

    // Handle special actions
    if (action === InputAction.GET_DESCRIPTION) {
      this.room.send('get_description');
    }
  }

  private setupUIButtons() {
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnAttack = document.getElementById('btnAttack');
    const btnGetLocation = document.getElementById('btnGetLocation');

    btnUp?.addEventListener('click', () => this.handleInput(InputAction.MOVE_UP));
    btnDown?.addEventListener('click', () => this.handleInput(InputAction.MOVE_DOWN));
    btnLeft?.addEventListener('click', () => this.handleInput(InputAction.MOVE_LEFT));
    btnRight?.addEventListener('click', () => this.handleInput(InputAction.MOVE_RIGHT));
    btnAttack?.addEventListener('click', () => this.handleInput(InputAction.ATTACK));
    btnGetLocation?.addEventListener('click', () => this.handleInput(InputAction.GET_DESCRIPTION));
  }

  private logAPICall(action: InputAction) {
    const apiDisplay = document.getElementById('apiCallDisplay');
    if (apiDisplay) {
      const timestamp = new Date().toLocaleTimeString();
      const apiCall = `[${timestamp}] room.send('input', { action: '${action}' })`;
      
      const currentLog = apiDisplay.innerHTML;
      if (currentLog.includes('Waiting for actions')) {
        apiDisplay.innerHTML = apiCall;
      } else {
        apiDisplay.innerHTML = apiCall + '<br>' + currentLog;
      }
      
      // Limit log entries
      const lines = apiDisplay.innerHTML.split('<br>');
      if (lines.length > 10) {
        apiDisplay.innerHTML = lines.slice(0, 10).join('<br>');
      }
    }
  }

  private updateStatus(message: string) {
    const statusText = document.getElementById('statusText');
    if (statusText) {
      statusText.textContent = message;
    }
  }

  private updateLocationInfo(data: any) {
    const locationInfo = document.getElementById('locationInfo');
    if (locationInfo) {
      locationInfo.style.display = 'block';
    }

    const posText = document.getElementById('posText');
    const terrainText = document.getElementById('terrainText');
    const healthText = document.getElementById('healthText');
    const scoreText = document.getElementById('scoreText');
    const nearbyText = document.getElementById('nearbyText');

    if (posText) posText.textContent = `(${data.position.x}, ${data.position.y})`;
    if (terrainText) terrainText.textContent = data.terrain;
    if (healthText) healthText.textContent = `${data.health}/100`;
    if (scoreText) scoreText.textContent = data.score.toString();
    
    if (nearbyText) {
      const nearbyItems = [];
      if (data.nearbyPlayers.length > 0) {
        nearbyItems.push(`${data.nearbyPlayers.length} player(s)`);
      }
      if (data.nearbyEnemies.length > 0) {
        nearbyItems.push(`${data.nearbyEnemies.length} enemy(ies)`);
      }
      nearbyText.textContent = nearbyItems.length > 0 ? nearbyItems.join(', ') : 'None';
    }

    // Log the API call
    const timestamp = new Date().toLocaleTimeString();
    const apiCall = `[${timestamp}] room.send('get_description')`;
    const apiDisplay = document.getElementById('apiCallDisplay');
    if (apiDisplay) {
      const currentLog = apiDisplay.innerHTML;
      if (currentLog.includes('Waiting for actions')) {
        apiDisplay.innerHTML = apiCall;
      } else {
        apiDisplay.innerHTML = apiCall + '<br>' + currentLog;
      }
    }
  }

  update() {
    this.inputHandler.update();
  }
}
