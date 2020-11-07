import { SceneUtil } from '../util/scene-util';
import { Scene } from 'phaser';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Sprite = Phaser.Physics.Arcade.Sprite;
import Vector2 = Phaser.Math.Vector2;

export class GameScene extends Scene {
   private readonly speed = 200;
   private cursorKeys: CursorKeys;
   private image: Sprite;

   constructor() {
      super({
         active: false,
         visible: false,
         key: 'Game', // TODO: Extract key
      });
   }

   create(): void {
      // TODO: Extract stuff
      // Add a player sprite that can be moved around. Place him in the middle of the screen.
      this.image = this.physics.add.sprite(SceneUtil.getWidth(this) / 2, SceneUtil.getHeight(this) / 2, 'man'); // TODO: Extract key

      // This is a nice helper Phaser provides to create listeners for some of the most common keys.
      this.cursorKeys = this.input.keyboard.createCursorKeys();
   }

   private readonly velocity = new Vector2();

   update(): void {
      // TODO: Extract content, controller movement, etc.
      // Every frame, we create a new velocity for the sprite based on what keys the player is holding down.
      this.velocity.set(0, 0);
      if (this.cursorKeys.left.isDown) {
         this.velocity.x -= 1;
      }
      if (this.cursorKeys.right.isDown) {
         this.velocity.x += 1;
      }
      if (this.cursorKeys.up.isDown) {
         this.velocity.y -= 1;
      }
      if (this.cursorKeys.down.isDown) {
         this.velocity.y += 1;
      }

      // We normalize the velocity so that the player is always moving at the same speed, regardless of direction.
      this.velocity.normalize();
      this.velocity.x *= this.speed;
      this.velocity.y *= this.speed;
      this.image.setVelocity(this.velocity.x, this.velocity.y);
   }
}
