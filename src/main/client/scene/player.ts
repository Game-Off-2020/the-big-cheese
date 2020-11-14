import * as Phaser from 'phaser';

interface PlayerOptions {
   readonly scene: Phaser.Scene;
   readonly x: number;
   readonly y: number;
}

export class Player extends Phaser.GameObjects.Sprite {
   constructor(options: PlayerOptions) {
      super(options.scene, options.x, options.y, 'character');
      options.scene.add.existing(this);

      this.setOrigin(0.5, 1);
   }
}
