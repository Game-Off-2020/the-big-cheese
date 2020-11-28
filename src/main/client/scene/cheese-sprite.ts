import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/client-constants';
import { Vector } from '../../shared/bullet/vector-model';

export class CheeseSprite extends Phaser.GameObjects.Sprite {
   constructor(protected readonly scene: Scene, private readonly position: Vector) {
      super(scene, position.x, position.y, Keys.CHEESE);
      scene.add.existing(this);
      this.setScale(0.035, 0.035);
   }

   destroyWithSound(volume: number): void {
      if (volume) {
         this.scene.sound
            .add(Keys.CHEESE_EAT_SOUND, {
               volume: 0.3 * volume,
               detune: 250 * Math.random() * 2 - 1,
            })
            .play();
      }
      super.destroy();
   }
}
