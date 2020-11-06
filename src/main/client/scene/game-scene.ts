import { SceneUtil } from "../util/scene-util";
import { Scene } from "phaser";
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Sprite = Phaser.Physics.Arcade.Sprite;

export class GameScene extends Scene {
   public speed = 200;
   private cursorKeys: CursorKeys;
   private image: Sprite;

   constructor() {
      super({
         active: false,
         visible: false,
         key: "Game" // TODO: Extract key
      });
   }

   public create(): void {
      // TODO: Extract stuff
      // Add a player sprite that can be moved around. Place him in the middle of the screen.
      this.image = this.physics.add.sprite(SceneUtil.getWidth(this) / 2, SceneUtil.getHeight(this) / 2, "man"); // TODO: Extract key

      // This is a nice helper Phaser provides to create listeners for some of the most common keys.
      this.cursorKeys = this.input.keyboard.createCursorKeys();
   }

   public update(): void {
      // TODO: Extract content, controller movement, etc.
      // Every frame, we create a new velocity for the sprite based on what keys the player is holding down.
      const velocity = new Phaser.Math.Vector2(0, 0);

      if (this.cursorKeys.left.isDown) {
         velocity.x -= 1;
      }
      if (this.cursorKeys.right.isDown) {
         velocity.x += 1;
      }
      if (this.cursorKeys.up.isDown) {
         velocity.y -= 1;
      }
      if (this.cursorKeys.down.isDown) {
         velocity.y += 1;
      }

      // We normalize the velocity so that the player is always moving at the same speed, regardless of direction.
      const normalizedVelocity = velocity.normalize();
      this.image.setVelocity(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);
   }
}
