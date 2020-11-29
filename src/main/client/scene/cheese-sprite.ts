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

interface CheeseTypeOptions {
   key: string;
   glowKey: string;
   scale: number;
   glowScale: number;
}

export class CheeseSprite extends Phaser.GameObjects.Container {
   private static readonly ICON_SCALE: { [key: number]: CheeseTypeOptions } = {
      0: {
         key: Keys.CHEESE,
         glowKey: Keys.CHEESE_GLOW,
         scale: 0.035,
         glowScale: 1.4,
      },
      1: {
         key: Keys.DOUBLE_BARREL,
         glowKey: Keys.CHEESE_GLOW,
         scale: 0.3,
         glowScale: 0,
      },
      2: {
         key: Keys.CHEESE,
         glowKey: Keys.CHEESE_GLOW,
         scale: 0.04,
         glowScale: 1.6,
      },
      3: {
         key: Keys.CHEESE_GREEN,
         glowKey: Keys.CHEESE_GREEN_GLOW,
         scale: 0.035,
         glowScale: 1.4,
      },
      4: {
         key: Keys.CHEESE_BOMB,
         glowKey: Keys.CHEESE_GLOW,
         scale: 0.25,
         glowScale: 0,
      },
   };

   constructor(private readonly options: CheeseOptions) {
      super(options.scene, options.position.x, options.position.y);
      this.setScale(CheeseSprite.ICON_SCALE[options.type].scale);

      const glowSprite = new Phaser.GameObjects.Sprite(
         options.scene,
         0,
         0,
         CheeseSprite.ICON_SCALE[options.type].glowKey,
      );
      const cheeseSprite = new Phaser.GameObjects.Sprite(
         options.scene,
         0,
         0,
         CheeseSprite.ICON_SCALE[options.type].key,
      );
      this.add(glowSprite);
      this.add(cheeseSprite);
      glowSprite.setScale(CheeseSprite.ICON_SCALE[options.type].glowScale);

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
         switch (this.options.type) {
            case CheeseType.BOMB:
               this.scene.sound
                  .add(Keys.CHEESE_BOMB_EXPLOSION, {
                     volume: 0.5 * volume,
                     detune: 250 * Math.random() * 2 - 1,
                  })
                  .play();
               break;
            case CheeseType.CHEESE_HALF:
               this.scene.sound
                  .add(Keys.CHEESE_GREEN_EAT, {
                     volume: 0.3 * volume,
                     detune: 250 * Math.random() * 2 - 1,
                  })
                  .play();
               break;
            case CheeseType.DOUBLE_BARREL:
               this.scene.sound
                  .add(Keys.DOUBLE_BARREL_COLLECT, {
                     volume: 0.3 * volume,
                     detune: 250 * Math.random() * 2 - 1,
                  })
                  .play();
               break;
            case CheeseType.CHEESE_DOUBLE:
               this.scene.sound
                  .add(Keys.CHEESE_DOUBLE_EAT_SOUND, {
                     volume: 0.3 * volume,
                     detune: 250 * Math.random() * 2 - 1,
                  })
                  .play();
               break;
            default:
               this.scene.sound
                  .add(Keys.CHEESE_EAT_SOUND, {
                     volume: 0.3 * volume,
                     detune: 250 * Math.random() * 2 - 1,
                  })
                  .play();
         }
      }
      super.destroy();
   }
}
