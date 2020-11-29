import * as Phaser from 'phaser';
import { Keys } from '../config/client-constants';
import { MathUtil } from '../util/math-util';
import { ClientConfig } from '../config/client-config';

// Documentation: https://phaser.io/examples/v3/view/physics/arcade/bullets-group
export interface BulletFireOptions {
   readonly position: Phaser.Math.Vector2;
   readonly direction: Phaser.Math.Vector2;
   readonly volume: number;
}

const DEFAULT_BULLET_SPEED = 0.85; // It needs to be synced with the server
const BULLET_SOUND_KEYS = [Keys.GUN_SOUND_1, Keys.GUN_SOUND_2, Keys.GUN_SOUND_3, Keys.GUN_SOUND_4];

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
   private cache: { [key: string]: DefaultBullet } = {};

   constructor(readonly scene: Phaser.Scene) {
      super(scene.physics.world, scene);

      this.createMultiple({
         frameQuantity: 100,
         key: Keys.BULLET,
         active: false,
         visible: false,
         classType: DefaultBullet,
      });
   }

   fireBullet(id: string, options: BulletFireOptions): void {
      const bullet: DefaultBullet = this.getFirstDead(false);
      if (bullet) {
         bullet.setScale(1 / ClientConfig.MAP_OUTPUT_SCALE, 1 / ClientConfig.MAP_OUTPUT_SCALE);
         this.cache[id] = bullet;
         bullet.fire(options);
         this.scene.sound
            .add(BULLET_SOUND_KEYS[MathUtil.randomIntFromInterval(0, BULLET_SOUND_KEYS.length - 1)], {
               volume: 0.3 * options.volume,
               detune: 100 * Math.random() * 2 - 1,
            })
            .play();
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
