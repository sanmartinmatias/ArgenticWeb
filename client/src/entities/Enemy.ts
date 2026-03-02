import Phaser from 'phaser';

export class Enemy {
  public sprite: Phaser.GameObjects.Rectangle;
  public healthBar: Phaser.GameObjects.Graphics;
  public id: string;
  public type: string;
  public health: number = 50;

  constructor(
    scene: Phaser.Scene,
    id: string,
    type: string,
    x: number,
    y: number,
    health: number
  ) {
    this.id = id;
    this.type = type;
    this.health = health;

    // Create enemy sprite
    const color = type === 'strong' ? 0xff0000 : 0xff6600;
    const size = type === 'strong' ? 25 : 20;
    this.sprite = scene.add.rectangle(x, y, size, size, color);
    
    // Create health bar
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();
  }

  updatePosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
    this.updateHealthBar();
  }

  updateHealth(health: number) {
    this.health = health;
    this.updateHealthBar();
  }

  private updateHealthBar() {
    this.healthBar.clear();
    
    const barWidth = 25;
    const barHeight = 3;
    const x = this.sprite.x - barWidth / 2;
    const y = this.sprite.y - 15;
    
    // Background
    this.healthBar.fillStyle(0x000000);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    
    // Health
    const maxHealth = this.type === 'strong' ? 100 : 50;
    const healthWidth = (this.health / maxHealth) * barWidth;
    this.healthBar.fillStyle(0xff0000);
    this.healthBar.fillRect(x, y, healthWidth, barHeight);
  }

  destroy() {
    this.sprite.destroy();
    this.healthBar.destroy();
  }
}
