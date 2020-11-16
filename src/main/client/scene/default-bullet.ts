// Documentation: https://phaser.io/examples/v3/view/physics/arcade/bullets-group
import * as Phaser from 'phaser';

export interface BulletFireOptions {
   readonly position: Phaser.Math.Vector2;
   readonly angle: Phaser.Math.Vector2;
}

const BULLET_SPEED = 300;

class DefaultBullet extends Phaser.Physics.Arcade.Sprite {
   private timeAlive = 0;
   private readonly lifeTime = 1000;

   constructor(scene: Phaser.Scene, x: number, y: number) {
      super(scene, x, y, 'bullet');
   }

   fire(options: BulletFireOptions): void {
      this.body.reset(options.position.x, options.position.y);

      this.setActive(true);
      this.setVisible(true);

      options.angle.scale(BULLET_SPEED);

      this.setVelocityY(options.angle.y);
      this.setVelocityX(options.angle.x);

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
   constructor(scene: Phaser.Scene) {
      super(scene.physics.world, scene);

      this.createMultiple({
         frameQuantity: 100,
         key: 'bullet',
         active: false,
         visible: false,
         classType: DefaultBullet,
      });
   }

   fireBullet(options: BulletFireOptions): void {
      const bullet = this.getFirstDead(false);

      if (bullet) {
         bullet.fire(options);
      }
   }
}
