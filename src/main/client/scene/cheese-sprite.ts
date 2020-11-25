import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/client-constants';
import { Vector } from '../../shared/bullet/vector-model';
import { MathUtil } from '../util/math-util';

export class CheeseSprite extends Phaser.GameObjects.Sprite {
   private readonly eatingSounds: Phaser.Sound.BaseSound[];

   constructor(protected readonly scene: Scene, private readonly position: Vector) {
      super(scene, position.x, position.y, Keys.CHEESE);
      scene.add.existing(this);
      this.setScale(0.2, 0.2);

      this.eatingSounds = [
         scene.sound.add(Keys.CHEESE_EAT_SOUND, {
            volume: 0.3,
         }),
         scene.sound.add(Keys.CHEESE_EAT_SOUND, {
            volume: 0.3,
            detune: -500,
         }),
         scene.sound.add(Keys.CHEESE_EAT_SOUND, {
            volume: 0.3,
            detune: -250,
         }),
         scene.sound.add(Keys.CHEESE_EAT_SOUND, {
            volume: 0.3,
            detune: 250,
         }),
         scene.sound.add(Keys.CHEESE_EAT_SOUND, {
            volume: 0.3,
            detune: 500,
         }),
      ];
   }

   destroy(): void {
      this.eatingSounds[MathUtil.randomIntFromInterval(0, this.eatingSounds.length - 1)].play();

      super.destroy();
   }
}
