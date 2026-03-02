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

    // Start button with enhanced styling
    const startButton = this.add.text(centerX, centerY + 50, '▶️ Start Game', {
      fontSize: '36px',
      color: '#00ff00',
      backgroundColor: '#003300',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();

    // Add pulsing animation to draw attention
    const pulseTween = this.tweens.add({
      targets: startButton,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#005500' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#003300' });
    });

    startButton.on('pointerdown', () => {
      // Stop the pulsing animation before transitioning
      pulseTween.stop();
      this.scene.start('GameScene');
    });

    // Instructions
    this.add.text(centerX, centerY + 150, 'Use Arrow Keys or WASD to move\nSpace to Attack\nL for Location Info', {
      fontSize: '16px',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);
    
    // Click instruction
    this.add.text(centerX, centerY + 220, '👆 Click the button above to start playing!', {
      fontSize: '14px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
  }
}
