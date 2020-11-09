import { SceneUtil } from '../util/scene-util';
import { Scene } from 'phaser';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Graphics = Phaser.GameObjects.Graphics;
import Sprite = Phaser.Physics.Arcade.Sprite;

interface Color {
   readonly red: number;
   readonly green: number;
   readonly blue: number;
   readonly alpha: number;
}

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
   private terrainTexture: Phaser.Textures.CanvasTexture;

   create(): void {
      const sceneWidth = (this.sceneWidth = SceneUtil.getWidth(this));
      this.sceneWidth2 = sceneWidth / 2;
      const sceneHeight = (this.sceneHeight = SceneUtil.getHeight(this));
      this.sceneHeight2 = sceneHeight / 2;

      this.character = this.physics.add.sprite(sceneWidth / 2, sceneHeight / 3, 'character'); // TODO: Extract key
      this.cursorKeys = this.input.keyboard.createCursorKeys();

      // Draw triangle objects to the scene
      const graphics: Graphics = this.add.graphics();
      for (let i = 0; i < 40; i++) {
         const angle = Phaser.Math.RND.rotation();
         const originX = Phaser.Math.RND.integerInRange(sceneWidth / 4, (3 * sceneWidth) / 4);
         const originY = Phaser.Math.RND.integerInRange(sceneHeight / 2, (3 * sceneHeight) / 4);
         const width = Phaser.Math.RND.integerInRange(75, 175);
         const triangle = Phaser.Geom.Triangle.BuildEquilateral(originX, originY, width);
         Phaser.Geom.Triangle.Rotate(triangle, angle);
         graphics.fillStyle(0x00dd00, 1);
         graphics.beginPath();
         graphics.moveTo(triangle.x1, triangle.y1);
         graphics.lineTo(triangle.x2, triangle.y2);
         graphics.lineTo(triangle.x3, triangle.y3);
         graphics.closePath();
         graphics.fillPath();
      }
      this.terrainTexture = this.textures.createCanvas('terrain', sceneWidth, sceneHeight);
      graphics.generateTexture(this.terrainTexture.getCanvas(), sceneWidth, sceneHeight);
      this.add.sprite(0, 0, 'terrain');

      this.cameras.main.startFollow(this.character);
   }

   private hitTestTerrain(worldX: number, worldY: number, width: number, height: number): boolean {
      const data = this.terrainTexture.getData(worldX, worldY, this.characterSize, this.characterSize2);
      for (let i = 0; i < width; i++) {
         for (let j = 0; j < height; j++) {
            if (this.testCollisionWithTerrain(i, j, data)) {
               return true;
            }
         }
      }
      return false;
   }

   private testCollisionWithTerrain(localX: number, localY: number, canvasData: ImageData): boolean {
      const pixel = this.getPixelColor(localX, localY, canvasData);

      if (pixel && pixel.alpha > 0) {
         return true;
      } else {
         return false;
      }
   }

   private getPixelColor(localX: number, localY: number, canvasData: ImageData): Color {
      if (localX < 0 || localY < 0 || localX > canvasData.width || localY > canvasData.height) return;

      const index = (localY * canvasData.width + localX) * 4;

      return {
         red: canvasData.data[index],
         green: canvasData.data[index + 1],
         blue: canvasData.data[index + 2],
         alpha: canvasData.data[index + 3],
      };
   }
   private createHole(worldX: number, worldY: number): void {
      this.terrainTexture.context.globalCompositeOperation = 'destination-out';
      this.terrainTexture.context.beginPath();
      this.terrainTexture.context.arc(worldX, worldY, 30, 0, Math.PI * 2, true);
      this.terrainTexture.context.fill();

      const newCanvasData = this.terrainTexture.context.getImageData(
         0,
         0,
         this.terrainTexture.getSourceImage().width,
         this.terrainTexture.getSourceImage().height,
      );

      this.terrainTexture.imageData = newCanvasData;
      this.terrainTexture.context.putImageData(newCanvasData, 0, 0);
      this.terrainTexture.refresh();
   }

   private jumping = false;
   private verticalSpeed = 0;

   update(): void {
      if (this.input.activePointer.isDown) {
         const touchX = this.input.activePointer.x;
         const touchY = this.input.activePointer.y;
         this.createHole(touchX, touchY);
      }

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
         this.verticalSpeed = -40;
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
