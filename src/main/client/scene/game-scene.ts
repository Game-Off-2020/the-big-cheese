import * as Phaser from 'phaser';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Sprite = Phaser.Physics.Arcade.Sprite;

interface Color {
   readonly red: number;
   readonly green: number;
   readonly blue: number;
   readonly alpha: number;
}

const MOON_RADIUS = 200;

export class GameScene extends Phaser.Scene {
   private readonly maxHorizontalSpeed = 3;
   private readonly characterHeight = 20;
   private readonly characterWidth = 10;
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

   private terrainTexture: Phaser.Textures.CanvasTexture;

   create(): void {
      this.character = this.physics.add.sprite(0, -400, 'character'); // TODO: Extract key
      this.character.setOrigin(0.5, 1);
      this.cursorKeys = this.input.keyboard.createCursorKeys();

      this.terrainTexture = this.textures.createCanvas('terrain', MOON_RADIUS * 2, MOON_RADIUS * 2);
      this.terrainTexture.context.beginPath();
      this.terrainTexture.context.fillStyle = '#00dd00';
      this.terrainTexture.context.arc(MOON_RADIUS, MOON_RADIUS, MOON_RADIUS, 0, Math.PI * 2, true);
      this.terrainTexture.context.fill();
      this.terrainTexture.refresh();
      this.add.image(0, 0, 'terrain');

      this.cameras.main.startFollow(this.character);
   }

   private hitTestTerrain(worldX: number, worldY: number, points: Phaser.Geom.Point[]): boolean {
      const localX = worldX + MOON_RADIUS;
      const localY = worldY + MOON_RADIUS;

      if (localX < 0 || localY < 0 || localX > MOON_RADIUS * 2 || localY > MOON_RADIUS * 2) return false;

      const data = this.terrainTexture.getData(localX, localY, this.characterWidth, this.characterHeight);
      this.add.rectangle(worldX, worldY, this.characterWidth, this.characterHeight, 0xe1eb34, 0.3);

      for (const point of points) {
         if (this.testCollisionWithTerrain(point.x, point.y, data)) {
            return true;
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

      this.terrainTexture.clear();

      this.terrainTexture.imageData = newCanvasData;
      this.terrainTexture.putData(newCanvasData, 0, 0);
      this.terrainTexture.refresh();
   }

   private jumping = false;
   private verticalSpeed = 0;

   private getDownwardVector(sprite: Phaser.GameObjects.Sprite): Phaser.Math.Vector2 {
      return new Phaser.Math.Vector2({ x: -sprite.x, y: -sprite.y }).normalize();
   }

   private getFloorVector(sprite: Phaser.GameObjects.Sprite): Phaser.Math.Vector2 {
      return this.getDownwardVector(sprite).normalizeRightHand();
   }

   private applyGravity(sprite: Phaser.GameObjects.Sprite): void {
      const vector = this.getDownwardVector(sprite).scale(-1);
      this.moveByVector(sprite, vector);
   }

   private applyGroundReactionForce(sprite: Phaser.GameObjects.Sprite): void {
      const vector = this.getDownwardVector(sprite).scale(0.5);
      this.moveByVector(sprite, vector);
   }

   private moveByVector(sprite: Phaser.GameObjects.Sprite, vector: Phaser.Math.Vector2): void {
      sprite.x += vector.x;
      sprite.y += vector.y;
   }

   private createLocalWall(sprite: Phaser.GameObjects.Sprite, length: number, localOffset: Phaser.Geom.Point): Phaser.Geom.Point[] {
      const downVector = this.getDownwardVector(sprite);

      const f = this.createCollisionLine(downVector, length);
      this.add.line(sprite.x, sprite.y, f[0].x, f[0].y, f[f.length - 1].x, f[f.length - 1].y, 0x00ff00, 0.3);

      return f;
   }

   private createLocalFloor(sprite: Phaser.GameObjects.Sprite, length: number, localOffset: Phaser.Geom.Point): Phaser.Geom.Point[] {
      const floorVector = this.getFloorVector(sprite);

      const f = this.createCollisionLine(floorVector, length);
      this.add.line(sprite.x, sprite.y, f[0].x, f[0].y, f[f.length - 1].x, f[f.length - 1].y, 0xff0000, 0.3);

      return f;
   }

   private createCollisionLine(vector: Phaser.Math.Vector2, length: number): Phaser.Geom.Point[] {
      return [...Array(length).keys()].map((i) => {
         const newDownVector = vector.clone().scale(i);
         return new Phaser.Geom.Point(newDownVector.x, newDownVector.y);
      });
   }

   private stickToGround(sprite: Phaser.GameObjects.Sprite): void {
      while (this.hitTestTerrain(sprite.x, sprite.y, this.createLocalFloor(sprite, 10, null))) {
         this.applyGravity(sprite);
      }
   }

   private moveLeft(sprite: Phaser.GameObjects.Sprite): void {
      const floorVector = this.getFloorVector(sprite);
      this.moveByVector(sprite, floorVector);
   }

   private moveRight(sprite: Phaser.GameObjects.Sprite): void {
      const floorVector = this.getFloorVector(sprite).scale(-1);
      this.moveByVector(sprite, floorVector);
   }

   update(): void {
      this.character.setRotation(this.getFloorVector(this.character).scale(-1).angle());
      if (this.input.activePointer.isDown) {
         const touchX = this.input.activePointer.x;
         const touchY = this.input.activePointer.y;
         this.createHole(touchX, touchY);
      }

      if (this.cursorKeys.left.isDown) {
         for (let _ = 0; _ < this.maxHorizontalSpeed; _++) {
            if (!this.hitTestTerrain(this.character.x - 1, this.character.y, this.createLocalWall(this.character, 10, null))) {
               this.moveLeft(this.character);
            }
            this.stickToGround(this.character);
         }
      }

      if (this.cursorKeys.right.isDown) {
         for (let _ = 0; _ < this.maxHorizontalSpeed; _++) {
            if (
               !this.hitTestTerrain(
                  this.character.x + this.characterWidth,
                  this.character.y,
                  this.createLocalWall(this.character, 10, null),
               )
            ) {
               this.moveRight(this.character);
            }
            this.stickToGround(this.character);
         }
      }

      if (this.cursorKeys.up.isDown && !this.jumping) {
         this.verticalSpeed = -40;
         this.jumping = true;
      }
      this.verticalSpeed++;
      this.verticalSpeed = Phaser.Math.Clamp(this.verticalSpeed, -this.maxVerticalSpeed, this.maxVerticalSpeed);

      if (this.verticalSpeed > 0) {
         for (let _ = 0; _ < this.verticalSpeed; _++) {
            if (
               !this.hitTestTerrain(
                  this.character.x,
                  this.character.y + this.characterHeight,
                  this.createLocalFloor(this.character, 10, null),
               )
            ) {
               // Ground
               this.applyGroundReactionForce(this.character);
            } else {
               // Air
               this.jumping = false;
               this.verticalSpeed = 0;
            }
         }
      } else {
         // Jumping
         for (let _ = 0; _ < Math.abs(this.verticalSpeed); _++) {
            this.stickToGround(this.character);
         }
      }
   }
}
