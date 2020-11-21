import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Inject } from 'typescript-ioc';
import { ClientMapComponent } from '../map/client-map-component';

import { PlayerSprite } from '../player/player-sprite';
import { Bullets } from '../bullet/default-bullet';
import { ClientPlayerComponent } from '../player/client-player-component';
import { MapSprite } from '../map/map-sprite';
import { LavaFloorSprite } from './lava-floor-sprite';
import { ClientBulletComponent } from '../bullet/client-bullet-component';
import { StarFieldSprite } from './star-field-sprite';
import { VectorUtil } from '../util/vector-util';
import { ClientOtherPlayerComponent } from '../player/client-other-player-component';
import { OtherPlayerSprite } from '../player/other-player-sprite';
import { ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export class GameScene extends Scene {
   private readonly maxHorizontalSpeed = 3;
   private readonly characterWidth = 10;
   private readonly maxVerticalSpeed = 10;
   private cursorKeys: CursorKeys;
   private character: PlayerSprite;
   private bullets?: Bullets;
   private mapSprite?: MapSprite;
   private lava?: LavaFloorSprite;

   @Inject
   private readonly mapComponent: ClientMapComponent;

   @Inject
   private readonly playerComponent: ClientPlayerComponent;

   @Inject
   private readonly otherPlayersComponent: ClientOtherPlayerComponent;

   @Inject
   private readonly bulletGroupComponent: ClientBulletComponent;

   private readonly otherPlayers = new Map<string, OtherPlayerSprite>();

   private readonly createdSubject = new ReplaySubject<boolean>();
   private readonly created$ = this.createdSubject.asObservable();

   constructor() {
      super({
         active: false,
         visible: false,
         key: 'Game', // TODO: Extract key
      });
      this.mapComponent.mapLoaded$.subscribe((canvas) => {
         this.mapSprite = new MapSprite({
            scene: this,
            canvas,
         });
         this.mapComponent.setMapSprite(this.mapSprite);
      });
      this.mapComponent.updated$.subscribe(() => this.mapSprite && this.mapSprite.update());
      this.created$.pipe(switchMap(() => this.otherPlayersComponent.added$)).subscribe((player) => {
         const sprite = new OtherPlayerSprite(this, player);
         this.otherPlayers.set(player.id, sprite);
      });
      this.otherPlayersComponent.removed$.subscribe((playerId) => {
         const sprite = this.otherPlayers.get(playerId);
         if (sprite) {
            sprite.destroy();
            this.otherPlayers.delete(playerId);
         }
      });
   }

   create(): void {
      this.cursorKeys = this.input.keyboard.createCursorKeys();

      this.character = new PlayerSprite({
         scene: this,
         cursorKeys: this.cursorKeys,
         callbacks: {
            onGoLeft: () => {
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
            },
            onGoRight: () => {
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
            },
            onShoot: (position) => {
               this.playerComponent.shoot({
                  position: position,
                  direction: VectorUtil.getRelativeMouseDirection(this, this.character),
               });
            },
         },
      });
      this.playerComponent.setClientPlayerSprite(this.character);
      this.cameras.main.startFollow(this.character);
      this.bullets = new Bullets(this);
      this.bulletGroupComponent.setBulletGroup(this.bullets);
      new StarFieldSprite({ scene: this });
      this.lava = new LavaFloorSprite({ scene: this, size: 100 });
      this.createdSubject.next(true);
   }

   private jumping = false;
   private verticalSpeed = 0;

   private applyGravity(sprite: Phaser.GameObjects.Components.Transform): void {
      const vector = VectorUtil.getDownwardVector(sprite).scale(-1);
      this.moveByVector(sprite, vector);
   }

   private applyGroundReactionForce(sprite: Phaser.GameObjects.Components.Transform): void {
      const vector = VectorUtil.getDownwardVector(sprite).scale(0.5);
      this.moveByVector(sprite, vector);
   }

   private moveByVector(sprite: Phaser.GameObjects.Components.Transform, vector: Phaser.Math.Vector2): void {
      sprite.x += vector.x;
      sprite.y += vector.y;
   }

   private createLocalWall(sprite: Phaser.GameObjects.Components.Transform, length: number): Phaser.Geom.Point[] {
      const downVector = VectorUtil.getDownwardVector(sprite);

      return this.createCollisionLine(downVector, length, -length);
   }

   private createLocalFloor(sprite: Phaser.GameObjects.Components.Transform, length: number): Phaser.Geom.Point[] {
      const floorVector = VectorUtil.getFloorVector(sprite);

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

   private stickToGround(sprite: Phaser.GameObjects.Components.Transform): void {
      while (this.mapSprite.hitTestTerrain(sprite.x, sprite.y, this.createLocalFloor(sprite, 10))) {
         this.applyGravity(sprite);
      }
   }

   private moveLeft(sprite: Phaser.GameObjects.Components.Transform): void {
      const floorVector = VectorUtil.getFloorVector(sprite);
      this.moveByVector(sprite, floorVector);
   }

   private moveRight(sprite: Phaser.GameObjects.Components.Transform): void {
      const floorVector = VectorUtil.getFloorVector(sprite).scale(-1);
      this.moveByVector(sprite, floorVector);
   }

   update(): void {
      if (!this.mapSprite) return;
      this.cameras.main.setRotation(-this.character.rotation);

      this.character.setRotation(VectorUtil.getFloorVector(this.character).scale(-1).angle());

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
               this.moveByVector(this.character, VectorUtil.getDownwardVector(this.character).scale(-1));
            } else {
               this.verticalSpeed = 0;
            }
         }
      }

      this.character.update();
      this.updateOtherPlayers();
   }

   private updateOtherPlayers(): void {
      for (const [playerId, sprite] of this.otherPlayers.entries()) {
         const player = this.otherPlayersComponent.getPlayer(playerId);
         if (player) {
            sprite.updatePlayer(player);
            sprite.update();
         }
      }
   }
}
