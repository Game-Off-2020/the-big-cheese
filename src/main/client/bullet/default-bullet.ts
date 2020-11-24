// Documentation: https://phaser.io/examples/v3/view/physics/arcade/bullets-group
import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/client-constants';
import { MathUtil } from '../util/math-util';
import { ClientConfig } from '../config/client-config';
import BaseSound = Phaser.Sound.BaseSound;

export interface BulletFireOptions {
   readonly position: Phaser.Math.Vector2;
   readonly direction: Phaser.Math.Vector2;
}

const DEFAULT_BULLET_SPEED = 0.85; // It needs to be synced with the server

class DefaultBullet extends Phaser.Physics.Arcade.Sprite {
   private timeAlive = 0;
   private readonly lifeTime: number = ClientConfig.BULLET_MAX_AGE_MS;

   constructor(scene: Phaser.Scene, x: number, y: number) {
      super(scene, x, y, Keys.BULLET);
   }

   fire(options: BulletFireOptions): void {
      this.body.reset(options.position.x, options.position.y);

      this.setActive(true);
      this.setVisible(true);

      options.direction.scale(DEFAULT_BULLET_SPEED * ClientConfig.BULLET_BASE_SPEED);

      this.setVelocity(options.direction.x, options.direction.y);
      this.setRotation(new Phaser.Math.Vector2({ x: options.direction.x, y: options.direction.y }).angle());

      this.timeAlive = 0;
   }

   preUpdate(time: number, delta: number): void {
      super.preUpdate(time, delta);

      if (this.timeAlive > this.lifeTime) {
         this.setActive(false);
         this.setVisible(false);
      } else {
         this.timeAlive += delta;
      }
   }
}

export class Bullets extends Phaser.Physics.Arcade.Group {
   private bulletSounds: Phaser.Sound.BaseSound[];
   private cache: { [key: string]: DefaultBullet } = {};

   constructor(scene: Phaser.Scene) {
      super(scene.physics.world, scene);

      this.createMultiple({
         frameQuantity: 100,
         key: Keys.BULLET,
         active: false,
         visible: false,
         classType: DefaultBullet,
      });

      this.bulletSounds = [
         ...this.varySound(scene, Keys.GUN_SOUND_1),
         ...this.varySound(scene, Keys.GUN_SOUND_2),
         ...this.varySound(scene, Keys.GUN_SOUND_3),
         ...this.varySound(scene, Keys.GUN_SOUND_4),
      ];
   }

   private varySound(scene: Scene, key: string): BaseSound[] {
      return [
         scene.sound.add(key, {
            volume: 0.3,
         }),
         scene.sound.add(key, {
            volume: 0.3,
            detune: -100,
         }),
         scene.sound.add(key, {
            volume: 0.3,
            detune: -50,
         }),
         scene.sound.add(key, {
            volume: 0.3,
            detune: 50,
         }),
      ];
   }

   fireBullet(id: string, options: BulletFireOptions): void {
      const bullet: DefaultBullet = this.getFirstDead(false);
      if (bullet) {
         bullet.setScale(1 / ClientConfig.MAP_OUTPUT_SCALE, 1 / ClientConfig.MAP_OUTPUT_SCALE);
         this.cache[id] = bullet;
         bullet.fire(options);
         this.bulletSounds[MathUtil.randomIntFromInterval(0, this.bulletSounds.length - 1)].play();
      }
   }

   killBullet(id: string): void {
      const bullet = this.cache[id];
      if (bullet) {
         bullet.setActive(false);
         bullet.setVisible(false);
         this.cache[id] = undefined;
      }
   }
}
