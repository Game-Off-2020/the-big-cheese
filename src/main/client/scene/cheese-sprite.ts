import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/client-constants';
import { Vector } from '../../shared/bullet/vector-model';
import { VectorUtil } from '../util/vector-util';
import { CheeseType } from '../../shared/cheese/cheese-model';

export interface CheeseOptions {
   readonly scene: Scene;
   readonly position: Vector;
   readonly type: CheeseType;
}

export class CheeseSprite extends Phaser.GameObjects.Container {
   private static readonly ICON_SCALE: { [key: string]: [string, number, number] } = {
      0: ['cheese', 0.035, 1.4],
      1: ['double-barrel', 0.3, 0],
      2: ['cheese', 0.04, 1.6],
   };

   constructor(private readonly options: CheeseOptions) {
      super(options.scene, options.position.x, options.position.y);
      this.setScale(CheeseSprite.ICON_SCALE[options.type][1]);

      const glowSprite = new Phaser.GameObjects.Sprite(options.scene, 0, 0, Keys.CHEESE_GLOW);
      const cheeseSprite = new Phaser.GameObjects.Sprite(options.scene, 0, 0, CheeseSprite.ICON_SCALE[options.type][0]);
      this.add(glowSprite);
      this.add(cheeseSprite);
      glowSprite.setScale(CheeseSprite.ICON_SCALE[options.type][2]);

      const downVector = VectorUtil.getDownwardVector(this).scale(3);
      const floorVector = VectorUtil.getFloorVector(this).scale(-1);

      this.setRotation(floorVector.angle());

      options.scene.tweens.add({
         targets: this,
         x: this.x + downVector.x,
         y: this.y + downVector.y,
         duration: 1000,
         ease: 'Sine.easeInOut',
         repeat: -1,
         yoyo: true,
      });

      options.scene.tweens.add({
         targets: glowSprite,
         alpha: { from: 0.3, to: 0.1 },
         duration: 600,
         ease: 'Sine.easeInOut',
         repeat: -1,
         yoyo: true,
      });

      if (options.type === CheeseType.CHEESE_DOUBLE) {
         options.scene.tweens.add({
            targets: [cheeseSprite, glowSprite],
            duration: 1500,
            repeat: -1,
            angle: 360,
         });
      }

      options.scene.add.existing(this);
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
