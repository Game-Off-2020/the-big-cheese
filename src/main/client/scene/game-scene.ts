import { SceneUtil } from '../util/scene-util';
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

export class GameScene extends Scene {
   private playerPosition = new Vector2();
   private playerPositionChangedSubject = new Subject<Vector2>();
   readonly playerPositionChanged$ = this.playerPositionChangedSubject.pipe();

   // private readonly velocity = new Vector2(0, 0);
   private readonly maxHorizontalSpeed = 3;
   private readonly characterSize = 20;
   private readonly characterSize2 = 10;
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
         this.add.sprite(400, 400, 'terrain');
      });
      this.mapComponent.updated$.subscribe(() => this.terrainTexture.update());
   }

   private sceneWidth: number;
   private sceneWidth2: number;
   private sceneHeight: number;
   private sceneHeight2: number;
   private terrainTexture?: Phaser.Textures.CanvasTexture;

   create(): void {
      const sceneWidth = (this.sceneWidth = SceneUtil.getWidth(this));
      this.sceneWidth2 = sceneWidth / 2;
      const sceneHeight = (this.sceneHeight = SceneUtil.getHeight(this));
      this.sceneHeight2 = sceneHeight / 2;

      this.character = this.physics.add.sprite(sceneWidth / 2, sceneHeight / 3, 'character'); // TODO: Extract key
      this.cursorKeys = this.input.keyboard.createCursorKeys();
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

   private jumping = false;
   private verticalSpeed = 0;

   update(): void {
      if (!this.terrainTexture) return;

      // TODO: We should emit an update$ event and we should handle character movement in another component
      if (this.cursorKeys.left.isDown) {
         for (let i = 0; i < this.maxHorizontalSpeed; i++) {
            if (!this.hitTestTerrain(this.character.x - 1, this.character.y, 1, this.characterSize - 3)) {
               this.character.x -= 1;
            }
            while (
               this.hitTestTerrain(this.character.x, this.character.y + this.characterSize, this.characterSize2, 1)
            ) {
               this.character.y -= 1;
            }
         }
      }

      if (this.cursorKeys.right.isDown) {
         for (let i = 0; i < this.maxHorizontalSpeed; i++) {
            if (
               !this.hitTestTerrain(this.character.x + this.characterSize2, this.character.y, 1, this.characterSize - 3)
            ) {
               this.character.x += 1;
            }
            while (
               this.hitTestTerrain(this.character.x, this.character.y + this.characterSize, this.characterSize2, 1)
            ) {
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
      if (this.playerPosition.x !== this.character.x || this.playerPosition.y !== this.character.y) {
         this.playerPosition.set(this.character.x, this.character.y);
         this.playerPositionChangedSubject.next(this.playerPosition);
      }
   }
}
