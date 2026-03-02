import { InputAction } from '@argentic/shared';

export class InputHandler {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private wasd: { [key: string]: Phaser.Input.Keyboard.Key } = {};
  private spaceKey: Phaser.Input.Keyboard.Key | undefined;
  private lKey: Phaser.Input.Keyboard.Key | undefined;
  private onInputCallback: (action: InputAction) => void;

  constructor(scene: Phaser.Scene, onInput: (action: InputAction) => void) {
    this.onInputCallback = onInput;

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.lKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    }
  }

  update() {
    if (!this.cursors) return;

    // Arrow keys or WASD
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) || Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
      this.onInputCallback(InputAction.MOVE_UP);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!) || Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
      this.onInputCallback(InputAction.MOVE_DOWN);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) || Phaser.Input.Keyboard.JustDown(this.wasd.left)) {
      this.onInputCallback(InputAction.MOVE_LEFT);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.wasd.right)) {
      this.onInputCallback(InputAction.MOVE_RIGHT);
    }

    // Attack
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.onInputCallback(InputAction.ATTACK);
    }

    // Get description
    if (this.lKey && Phaser.Input.Keyboard.JustDown(this.lKey)) {
      this.onInputCallback(InputAction.GET_DESCRIPTION);
    }
  }
}
