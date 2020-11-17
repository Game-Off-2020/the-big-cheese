import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Inject } from 'typescript-ioc';
import { ClientMapComponent } from '../map/client-map-component';

import { PlayerSprite } from '../player/player-sprite';
import { Bullets } from '../bullet/default-bullet';
import { ClientPlayerComponent } from '../player/client-player-component';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Vector2 = Phaser.Math.Vector2;
import { MapSprite } from '../map/map-sprite';
import { LavaFloorSprite } from './lava-floor-sprite';
import { BulletGroupComponent } from '../bullet/bullet-group-component';

export class GameScene extends Scene {
   private readonly maxHorizontalSpeed = 3;
   private readonly characterWidth = 10;
   private readonly maxVerticalSpeed = 10;
   private cursorKeys: CursorKeys;
   private character: PlayerSprite;
   private bullets?: Bullets;
   private mapSprite?: MapSprite;
   private lava?: LavaFloorSprite;

   // TODO: It is injected just temporarily, not sure where it should be
   @Inject
   private readonly mapComponent: ClientMapComponent;

   @Inject
   private readonly playerComponent: ClientPlayerComponent;

   @Inject
   private readonly bulletGroupComponent: BulletGroupComponent;

   constructor() {
      super({
         active: false,
         visible: false,
         key: 'Game', // TODO: Extract key
      });
      this.mapComponent.mapLoaded$.subscribe((canvas) => {
         this.mapSprite = new MapSprite({
            scene: this,
            canvas: canvas,
         });
      });
      this.mapComponent.updated$.subscribe(() => this.mapSprite && this.mapSprite.update());
   }

   create(): void {
      this.character = new PlayerSprite(this);
      this.playerComponent.setClientPlayerSprite(this.character);
      this.cameras.main.startFollow(this.character);
      this.cursorKeys = this.input.keyboard.createCursorKeys();
      this.bullets = new Bullets(this);
      this.bulletGroupComponent.setBulletGroup(this.bullets);
      this.lava = new LavaFloorSprite({ scene: this, size: 100 });
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
      while (this.mapSprite.hitTestTerrain(sprite.x, sprite.y, this.createLocalFloor(sprite, 10))) {
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
      if (!this.mapSprite) return;
      this.cameras.main.setRotation(-this.character.rotation);

      this.character.setRotation(this.getFloorVector(this.character).scale(-1).angle());
      if (this.input.activePointer.isDown) {
         const charPosition = new Vector2({ x: this.character.x, y: this.character.y });
         this.playerComponent.shoot({
            position: charPosition,
            direction: new Vector2({ x: this.input.activePointer.x, y: this.input.activePointer.y })
               .subtract(new Vector2({ x: this.game.scale.width / 2, y: this.game.scale.height / 2 }))
               .normalize()
               .rotate(this.character.rotation),
         });
      }

      if (this.cursorKeys.left.isDown) {
         for (let _ = 0; _ < this.maxHorizontalSpeed; _++) {
            if (
               !this.mapSprite.hitTestTerrain(
                  this.character.x - 1,
                  this.character.y,
                  this.createLocalWall(this.character, 10),
               )
            ) {
               this.moveLeft(this.character);
            }
            this.stickToGround(this.character);
         }
      }

      if (this.cursorKeys.right.isDown) {
         for (let _ = 0; _ < this.maxHorizontalSpeed; _++) {
            if (
               !this.mapSprite.hitTestTerrain(
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
            if (
               !this.mapSprite.hitTestTerrain(
                  this.character.x,
                  this.character.y,
                  this.createLocalFloor(this.character, 10),
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
            if (
               !this.mapSprite.hitTestTerrain(
                  this.character.x,
                  this.character.y,
                  this.createLocalFloor(this.character, 10),
               )
            ) {
               this.moveByVector(this.character, this.getDownwardVector(this.character).scale(-1));
            } else {
               this.verticalSpeed = 0;
            }
         }
      }

      this.character.update();
   }
}
