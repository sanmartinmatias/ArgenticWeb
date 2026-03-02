import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { MainMenu } from './scenes/MainMenu';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'gameCanvas',
  backgroundColor: '#1a1a2e',
  scene: [MainMenu, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  }
};

new Phaser.Game(config);
