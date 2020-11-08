import { SceneUtil } from '../util/scene-util';
import { Scene } from 'phaser';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Graphics = Phaser.GameObjects.Graphics;
import Sprite = Phaser.Physics.Arcade.Sprite;

export class GameScene extends Scene {
   // private readonly velocity = new Vector2(0, 0);
   private readonly maxHorizontalSpeed = 3;
   private readonly characterSize = 20;
   private readonly characterSize2 = 10;
   private readonly maxVerticalSpeed = 10;
   private cursorKeys: CursorKeys;
   private character: Sprite;

   constructor() {
      super({
         active: false,
         visible: false,
         key: 'Game', // TODO: Extract key
      });
   }

   private sceneWidth: number;
   private sceneWidth2: number;
   private sceneHeight: number;
   private sceneHeight2: number;

   create(): void {
      const sceneWidth = (this.sceneWidth = SceneUtil.getWidth(this));
      this.sceneWidth2 = sceneWidth / 2;
      const sceneHeight = (this.sceneHeight = SceneUtil.getHeight(this));
      this.sceneHeight2 = sceneHeight / 2;

      this.character = this.physics.add.sprite(sceneWidth / 2, sceneHeight / 3, 'character'); // TODO: Extract key
      this.cursorKeys = this.input.keyboard.createCursorKeys();

      // Draw triangle objects to the scene
      const terrain: Graphics = this.add.graphics();
      for (let i = 0; i < 40; i++) {
         const angle = Phaser.Math.RND.rotation();
         const originX = Phaser.Math.RND.integerInRange(sceneWidth / 4, (3 * sceneWidth) / 4);
         const originY = Phaser.Math.RND.integerInRange(sceneHeight / 2, (3 * sceneHeight) / 4);
         const width = Phaser.Math.RND.integerInRange(75, 175);
         const triangle = Phaser.Geom.Triangle.BuildEquilateral(originX, originY, width);
         Phaser.Geom.Triangle.Rotate(triangle, angle);
         terrain.fillStyle(0x00dd00, 1);
         terrain.beginPath();
         terrain.moveTo(triangle.x1, triangle.y1);
         terrain.lineTo(triangle.x2, triangle.y2);
         terrain.lineTo(triangle.x3, triangle.y3);
         terrain.closePath();
         terrain.fillPath();
      }
      terrain.generateTexture('terrain', sceneWidth, sceneHeight);
      terrain.clear();
      this.add.sprite(sceneWidth / 2, sceneHeight / 2, 'terrain');
   }

   private hitTestTerrain(x: number, y: number, w: number, h: number): boolean {
      for (let i = x; i < x + w; i++) {
         for (let j = y; j < y + h; j++) {
            if (this.textures.getPixelAlpha(i, j, 'terrain')) {
               return true;
            }
         }
      }
      return false;
   }

   private jumping = false;
   private verticalSpeed = 0;

   update(): void {
      if (this.cursorKeys.left.isDown) {
         for (let i = 0; i < this.maxHorizontalSpeed; i++) {
            if (!this.hitTestTerrain(this.character.x - 1, this.character.y, 1, this.characterSize - 3)) {
               this.character.x -= 1;
            }
            while (this.hitTestTerrain(this.character.x, this.character.y + this.characterSize, this.characterSize2, 1)) {
               this.character.y -= 1;
            }
         }
      }

      if (this.cursorKeys.right.isDown) {
         for (let i = 0; i < this.maxHorizontalSpeed; i++) {
            if (!this.hitTestTerrain(this.character.x + this.characterSize2, this.character.y, 1, this.characterSize - 3)) {
               this.character.x += 1;
            }
            while (this.hitTestTerrain(this.character.x, this.character.y + this.characterSize, this.characterSize2, 1)) {
               this.character.y -= 1;
            }
         }
      }

      if (this.cursorKeys.up.isDown && !this.jumping) {
         this.verticalSpeed = -10;
         this.jumping = true;
      }
      this.verticalSpeed++;
      this.verticalSpeed = Phaser.Math.Clamp(this.verticalSpeed, -this.maxVerticalSpeed, this.maxVerticalSpeed);

      if (this.verticalSpeed > 0) {
         for (let i = 0; i < this.verticalSpeed; i++) {
            if (!this.hitTestTerrain(this.character.x, this.character.y + this.characterSize, this.characterSize2, 1)) {
               // Ground
               this.character.y += 0.5;
               // this.velocity.y += this.gravity;
            } else {
               // Air
               this.jumping = false;
               this.verticalSpeed = 0;
               // this.velocity.y = 0;
            }
         }
      } else {
         for (let i = 0; i < Math.abs(this.verticalSpeed); i++) {
            if (!this.hitTestTerrain(this.character.x, this.character.y, this.characterSize2, 1)) {
               this.character.y -= 1;
            } else {
               this.verticalSpeed = 0;
            }
         }
      }
      // this.character.y += this.velocity.y;
   }
}
