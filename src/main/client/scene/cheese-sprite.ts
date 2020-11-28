import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/client-constants';
import { Vector } from '../../shared/bullet/vector-model';
import { VectorUtil } from '../util/vector-util';

export class CheeseSprite extends Phaser.GameObjects.Container {
   constructor(protected readonly scene: Scene, position: Vector) {
      super(scene, position.x, position.y);

      const glowSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, Keys.CHEESE_GLOW);
      const cheeseSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, Keys.CHEESE);
      this.add(glowSprite);
      this.add(cheeseSprite);
      glowSprite.setScale(1.4);

      this.setScale(0.035);

      const downVector = VectorUtil.getDownwardVector(this).scale(3);
      const floorVector = VectorUtil.getFloorVector(this).scale(-1);

      this.setRotation(floorVector.angle());

      scene.tweens.add({
         targets: this,
         x: this.x + downVector.x,
         y: this.y + downVector.y,
         duration: 1000,
         ease: 'Sine.easeInOut',
         repeat: -1,
         yoyo: true,
      });

      scene.tweens.add({
         targets: glowSprite,
         alpha: { from: 0.3, to: 0.1 },
         duration: 600,
         ease: 'Sine.easeInOut',
         repeat: -1,
         yoyo: true,
      });

      scene.add.existing(this);
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
