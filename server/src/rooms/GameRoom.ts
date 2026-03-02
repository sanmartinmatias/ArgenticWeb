import { Room, Client } from "colyseus";
import { GameRoomState, Player, Enemy, Position } from "./GameRoomState";
import { InputAction } from "@argentic/shared";

export class GameRoom extends Room<GameRoomState> {
  maxClients = 20;
  private moveSpeed = 5;

  onCreate(options: any) {
    this.setState(new GameRoomState());
    
    // Spawn some initial enemies
    this.spawnEnemies(5);

    // Handle player input
    this.onMessage("input", (client, message) => {
      this.handlePlayerInput(client.sessionId, message.action);
    });

    // Handle AI agent actions via message
    this.onMessage("ai_action", (client, message) => {
      this.handlePlayerInput(client.sessionId, message.action);
    });

    // Handle get description request
    this.onMessage("get_description", (client) => {
      const description = this.getLocationDescription(client.sessionId);
      client.send("location_description", description);
    });

    // Game loop
    this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  onJoin(client: Client, options: any) {
    console.log(`Player ${client.sessionId} joined`);
    
    const player = new Player();
    player.id = client.sessionId;
    player.name = options.name || `Player_${client.sessionId.substring(0, 6)}`;
    player.isAI = options.isAI || false;
    
    // Random spawn position
    player.position.x = Math.random() * this.state.worldWidth;
    player.position.y = Math.random() * this.state.worldHeight;
    
    this.state.players.set(client.sessionId, player);

    // Send welcome message with API info
    client.send("welcome", {
      playerId: client.sessionId,
      message: "Welcome to the game!",
      apiCalls: {
        move_up: { action: InputAction.MOVE_UP },
        move_down: { action: InputAction.MOVE_DOWN },
        move_left: { action: InputAction.MOVE_LEFT },
        move_right: { action: InputAction.MOVE_RIGHT },
        attack: { action: InputAction.ATTACK },
        get_description: "send message 'get_description'"
      }
    });
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Player ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("Room disposed");
  }

  private handlePlayerInput(playerId: string, action: InputAction) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    switch (action) {
      case InputAction.MOVE_UP:
        player.position.y = Math.max(0, player.position.y - this.moveSpeed);
        break;
      case InputAction.MOVE_DOWN:
        player.position.y = Math.min(this.state.worldHeight, player.position.y + this.moveSpeed);
        break;
      case InputAction.MOVE_LEFT:
        player.position.x = Math.max(0, player.position.x - this.moveSpeed);
        break;
      case InputAction.MOVE_RIGHT:
        player.position.x = Math.min(this.state.worldWidth, player.position.x + this.moveSpeed);
        break;
      case InputAction.ATTACK:
        this.handleAttack(playerId);
        break;
    }

    this.state.timestamp = Date.now();
  }

  private handleAttack(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    const attackRange = 30;
    
    // Check for enemies in range
    this.state.enemies.forEach((enemy, enemyId) => {
      const distance = this.calculateDistance(player.position, enemy.position);
      if (distance <= attackRange) {
        enemy.health -= 25;
        if (enemy.health <= 0) {
          this.state.enemies.delete(enemyId);
          player.score += 10;
        }
      }
    });
  }

  private spawnEnemies(count: number) {
    for (let i = 0; i < count; i++) {
      const enemy = new Enemy();
      enemy.id = `enemy_${i}_${Date.now()}`;
      enemy.type = Math.random() > 0.5 ? "basic" : "strong";
      enemy.health = enemy.type === "strong" ? 100 : 50;
      enemy.position.x = Math.random() * this.state.worldWidth;
      enemy.position.y = Math.random() * this.state.worldHeight;
      
      this.state.enemies.set(enemy.id, enemy);
    }
  }

  private update(deltaTime: number) {
    // Simple enemy AI - move randomly
    this.state.enemies.forEach((enemy) => {
      if (Math.random() > 0.98) {
        const direction = Math.random() * Math.PI * 2;
        enemy.position.x += Math.cos(direction) * 2;
        enemy.position.y += Math.sin(direction) * 2;
        
        // Keep in bounds
        enemy.position.x = Math.max(0, Math.min(this.state.worldWidth, enemy.position.x));
        enemy.position.y = Math.max(0, Math.min(this.state.worldHeight, enemy.position.y));
      }
    });
  }

  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getLocationDescription(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) {
      return { error: "Player not found" };
    }

    const nearbyPlayers: Array<{ id: string; name: string; distance: number }> = [];
    const nearbyEnemies: Array<{ id: string; type: string; distance: number }> = [];

    // Find nearby players
    this.state.players.forEach((otherPlayer, otherId) => {
      if (otherId !== playerId) {
        const distance = this.calculateDistance(player.position, otherPlayer.position);
        if (distance < 100) {
          nearbyPlayers.push({
            id: otherPlayer.id,
            name: otherPlayer.name,
            distance: Math.round(distance)
          });
        }
      }
    });

    // Find nearby enemies
    this.state.enemies.forEach((enemy) => {
      const distance = this.calculateDistance(player.position, enemy.position);
      if (distance < 100) {
        nearbyEnemies.push({
          id: enemy.id,
          type: enemy.type,
          distance: Math.round(distance)
        });
      }
    });

    const terrain = this.getTerrainType(player.position);

    return {
      position: { x: Math.round(player.position.x), y: Math.round(player.position.y) },
      description: `You are at position (${Math.round(player.position.x)}, ${Math.round(player.position.y)}) in ${terrain} terrain.`,
      nearbyPlayers,
      nearbyEnemies,
      terrain,
      health: player.health,
      score: player.score
    };
  }

  private getTerrainType(position: Position): string {
    const x = position.x;
    const y = position.y;
    
    if (x < 200 && y < 200) return "forest";
    if (x > 600 && y < 200) return "mountains";
    if (x < 200 && y > 400) return "swamp";
    if (x > 600 && y > 400) return "desert";
    return "plains";
  }
}
