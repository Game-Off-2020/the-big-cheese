import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Subject } from 'rxjs';
import { Inject } from 'typescript-ioc';
import { ClientMapComponent } from '../map/client-map-component';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Sprite = Phaser.Physics.Arcade.Sprite;
import Vector2 = Phaser.Math.Vector2;

interface Color {
   readonly red: number;
   readonly green: number;
   readonly blue: number;
   readonly alpha: number;
}

const MOON_RADIUS = 1000; // TODO: Should be set via map data (we have canvas size and size property in map component)

export class GameScene extends Scene {
   private playerPosition = new Vector2();
   private playerPositionChangedSubject = new Subject<Vector2>();
   readonly playerPositionChanged$ = this.playerPositionChangedSubject.pipe();

   // private readonly velocity = new Vector2(0, 0);
   private readonly maxHorizontalSpeed = 3;
   private readonly characterHeight = 20;
   private readonly characterWidth = 10;
   private readonly maxVerticalSpeed = 10;
   private cursorKeys: CursorKeys;
   private character: Sprite;

   // TODO: It is injected just temporarily, not sure where it should be
   @Inject
   private readonly mapComponent: ClientMapComponent;

   constructor() {
      super({
         active: false,
         visible: false,
         key: 'Game', // TODO: Extract key
      });
      this.mapComponent.mapLoaded$.subscribe((canvas) => {
         this.terrainTexture = this.textures.addCanvas('terrain', canvas);
         this.add.sprite(0, 0, 'terrain');
      });
      this.mapComponent.updated$.subscribe(() => this.terrainTexture && this.terrainTexture.update());
   }

   private terrainTexture?: Phaser.Textures.CanvasTexture;

   create(): void {
      this.character = this.physics.add.sprite(0, -1200, 'character'); // TODO: Extract key
      this.character.setOrigin(0.5, 1);
      this.cameras.main.startFollow(this.character);
      this.cursorKeys = this.input.keyboard.createCursorKeys();
   }

   private hitTestTerrain(worldX: number, worldY: number, points: Phaser.Geom.Point[]): boolean {
      const localX = worldX + MOON_RADIUS;
      const localY = worldY + MOON_RADIUS;

      if (localX < 0 || localY < 0 || localX > MOON_RADIUS * 2 || localY > MOON_RADIUS * 2) return false;

      const data = this.terrainTexture.getData(localX, localY, this.characterWidth, this.characterHeight);

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

   private createLocalWall(sprite: Phaser.GameObjects.Sprite, length: number): Phaser.Geom.Point[] {
      const downVector = this.getDownwardVector(sprite);

      return this.createCollisionLine(downVector, length, -length);
   }

   private createLocalFloor(sprite: Phaser.GameObjects.Sprite, length: number): Phaser.Geom.Point[] {
      const floorVector = this.getFloorVector(sprite);

      return this.createCollisionLine(floorVector, length, -length / 2);
   }

   private createCollisionLine(vector: Phaser.Math.Vector2, length: number, offset: number): Phaser.Geom.Point[] {
      return [...Array(length).keys()]
         .map((key) => key + offset)
         .map((i) => {
            const newDownVector = vector.clone().scale(i);
            return new Phaser.Geom.Point(newDownVector.x, newDownVector.y);
         });
   }

   private stickToGround(sprite: Phaser.GameObjects.Sprite): void {
      while (this.hitTestTerrain(sprite.x, sprite.y, this.createLocalFloor(sprite, 10))) {
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
      if (!this.terrainTexture) return;
      this.cameras.main.setRotation(-this.character.rotation);

      this.character.setRotation(this.getFloorVector(this.character).scale(-1).angle());
      if (this.input.activePointer.isDown) {
         const touchX = this.input.activePointer.x;
         const touchY = this.input.activePointer.y;
         this.createHole(touchX, touchY);
      }

      if (this.cursorKeys.left.isDown) {
         for (let _ = 0; _ < this.maxHorizontalSpeed; _++) {
            if (
               !this.hitTestTerrain(this.character.x - 1, this.character.y, this.createLocalWall(this.character, 10))
            ) {
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
                  this.createLocalWall(this.character, 10),
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
            if (!this.hitTestTerrain(this.character.x, this.character.y, this.createLocalFloor(this.character, 10))) {
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
            if (!this.hitTestTerrain(this.character.x, this.character.y, this.createLocalFloor(this.character, 10))) {
               this.moveByVector(this.character, this.getDownwardVector(this.character).scale(-1));
            } else {
               this.verticalSpeed = 0;
            }
         }
      }
      if (this.playerPosition.x !== this.character.x || this.playerPosition.y !== this.character.y) {
         this.playerPosition.set(this.character.x, this.character.y);
         this.playerPositionChangedSubject.next(this.playerPosition);
      }
   }
}
