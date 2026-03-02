import Phaser from 'phaser';

export class Player {
  public sprite: Phaser.GameObjects.Rectangle;
  public nameText: Phaser.GameObjects.Text;
  public healthBar: Phaser.GameObjects.Graphics;
  public id: string;
  public name: string;
  public health: number = 100;
  public isLocalPlayer: boolean = false;

  constructor(
    scene: Phaser.Scene,
    id: string,
    name: string,
    x: number,
    y: number,
    isLocalPlayer: boolean = false
  ) {
    this.id = id;
    this.name = name;
    this.isLocalPlayer = isLocalPlayer;

    // Create player sprite (rectangle for now)
    const color = isLocalPlayer ? 0x00ff00 : 0x0099ff;
    this.sprite = scene.add.rectangle(x, y, 30, 30, color);
    
    // Add name label
    this.nameText = scene.add.text(x, y - 25, name, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 }
    });
    this.nameText.setOrigin(0.5);

    // Create health bar
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();
  }

  updatePosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
    this.nameText.setPosition(x, y - 25);
    this.updateHealthBar();
  }

  updateHealth(health: number) {
    this.health = health;
    this.updateHealthBar();
  }

  private updateHealthBar() {
    this.healthBar.clear();
    
    const barWidth = 30;
    const barHeight = 4;
    const x = this.sprite.x - barWidth / 2;
    const y = this.sprite.y - 20;
    
    // Background
    this.healthBar.fillStyle(0x000000);
    this.healthBar.fillRect(x, y, barWidth, barHeight);
    
    // Health
    const healthWidth = (this.health / 100) * barWidth;
    const healthColor = this.health > 50 ? 0x00ff00 : this.health > 25 ? 0xffff00 : 0xff0000;
    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(x, y, healthWidth, barHeight);
  }

  destroy() {
    this.sprite.destroy();
    this.nameText.destroy();
    this.healthBar.destroy();
  }
}
