import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/client-constants';
import { VectorUtil } from '../util/vector-util';
import Vector2 = Phaser.Math.Vector2;

interface GunOptions {
   readonly scene: Scene;
   readonly character: Phaser.GameObjects.Sprite;
   readonly x: number;
   readonly y: number;
}

export class GunSprite extends Phaser.GameObjects.Sprite {
   private relativeDirection?: Vector2;

   constructor(private readonly options: GunOptions) {
      super(options.scene, options.x, options.y, Keys.BASIC_GUN);
      this.flip(true);
   }

   setRelativeDirection(x: number, y: number): void {
      if (this.relativeDirection === undefined) {
         this.relativeDirection = new Vector2();
      }
      this.relativeDirection.set(x, y);
   }

   update(): void {
      const direction =
         this.relativeDirection === undefined
            ? VectorUtil.getRelativeMouseDirection(this.scene, this.options.character)
            : this.relativeDirection;
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
