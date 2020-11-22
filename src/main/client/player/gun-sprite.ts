import * as Phaser from 'phaser';

import { Scene } from 'phaser';
import { Keys } from '../util/keys';
import { VectorUtil } from '../util/vector-util';

interface GunOptions {
   readonly scene: Scene;
   readonly character: Phaser.GameObjects.Sprite;
   readonly x: number;
   readonly y: number;
}

export class GunSprite extends Phaser.GameObjects.Sprite {
   constructor(private readonly options: GunOptions) {
      super(options.scene, options.x, options.y, Keys.BASIC_GUN);

      this.setOrigin(0.2, 0.7);
   }

   update(): void {
      const direction = VectorUtil.getRelativeMouseDirection(this.scene, this.options.character);

      this.setRotation(direction.angle());
   }

   flip(flip: boolean): void {
      if (flip) {
         this.flipY = true;
         this.setOrigin(0.2, 0.3);
      } else {
         this.flipY = false;
         this.setOrigin(0.2, 0.7);
      }
   }
}
