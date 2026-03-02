import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Title
    this.add.text(centerX, centerY - 100, 'Argentic Game', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 40, 'Multiplayer for Humans & AI', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(centerX, centerY + 50, 'Start Game', {
      fontSize: '32px',
      color: '#00ff00',
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#005500' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#003300' });
    });

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Instructions
    this.add.text(centerX, centerY + 150, 'Use Arrow Keys or WASD to move\nSpace to Attack\nL for Location Info', {
      fontSize: '16px',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);
  }
}
