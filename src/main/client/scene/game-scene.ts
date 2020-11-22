import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Inject } from 'typescript-ioc';
import { ClientMapComponent } from '../map/client-map-component';

import { PlayerSprite } from '../player/player-sprite';
import { Bullets } from '../bullet/default-bullet';
import { ClientPlayerComponent } from '../player/client-player-component';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import { MapSprite } from '../map/map-sprite';
import { LavaFloorSprite } from './lava-floor-sprite';
import { ClientBulletComponent } from '../bullet/client-bullet-component';
import { StarFieldSprite } from './star-field-sprite';
import { VectorUtil } from '../util/vector-util';

export class GameScene extends Scene {
   private readonly characterWidth = 10;
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
   private readonly bulletGroupComponent: ClientBulletComponent;

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
      this.mapComponent.updated$.subscribe(() => {
         this.mapSprite && this.mapSprite.update();
      });
   }

   create(): void {
      this.cursorKeys = this.input.keyboard.createCursorKeys();

      this.character = new PlayerSprite({
         scene: this,
         cursorKeys: this.cursorKeys,
         callbacks: {
            onShoot: (position) => {
               this.playerComponent.shoot({
                  position: position,
                  direction: VectorUtil.getRelativeMouseDirection(this, this.character),
               });
            },
         },
         physics: {
            leftWallCollision: (player, width, height) => {
               const locationOfWall = new Phaser.Math.Vector2({ x: player.x, y: player.y })
                  .subtract(VectorUtil.getFloorVector(player).scale(-width / 2))
                  .add(VectorUtil.getUpwardVector(player).scale(height));
               return this.mapSprite.hitTestTerrain(
                  locationOfWall.x,
                  locationOfWall.y,
                  VectorUtil.createLocalWall(player, 1),
               );
            },
            rightWallCollision: (player, width, height) => {
               const locationOfWall = new Phaser.Math.Vector2({ x: player.x, y: player.y })
                  .subtract(VectorUtil.getFloorVector(player).scale(width / 2))
                  .add(VectorUtil.getUpwardVector(player).scale(height));
               return this.mapSprite.hitTestTerrain(
                  locationOfWall.x,
                  locationOfWall.y,
                  VectorUtil.createLocalWall(player, 1),
               );
            },
            floorCollision: (player, width) => {
               const locationOfFloor = new Phaser.Math.Vector2({ x: player.x, y: player.y }).subtract(
                  VectorUtil.getFloorVector(player).scale(width / 2),
               );
               return this.mapSprite.hitTestTerrain(
                  locationOfFloor.x,
                  locationOfFloor.y,
                  VectorUtil.createLocalFloor(player, width),
               );
            },
            ceilingCollision: (player, width, height) => {
               const locationOfCeiling = new Phaser.Math.Vector2({ x: player.x, y: player.y })
                  .subtract(VectorUtil.getFloorVector(player).scale(width / 2))
                  .add(VectorUtil.getUpwardVector(player).scale(height));
               return this.mapSprite.hitTestTerrain(
                  locationOfCeiling.x,
                  locationOfCeiling.y,
                  VectorUtil.createLocalFloor(player, width),
               );
            },
         },
      });
      this.playerComponent.setClientPlayerSprite(this.character);
      this.cameras.main.startFollow(this.character);
      this.bullets = new Bullets(this);
      this.bulletGroupComponent.setBulletGroup(this.bullets);
      new StarFieldSprite({ scene: this });
      this.lava = new LavaFloorSprite({ scene: this, size: 100 });
   }

   update(): void {
      if (!this.mapSprite) return;
      this.cameras.main.setRotation(-this.character.rotation);
      this.character.update();
   }
}
