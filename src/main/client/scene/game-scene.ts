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
   private graphics: Phaser.GameObjects.Graphics;

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
            leftWallCollision: (player) => {
               const locationOfWall = new Phaser.Math.Vector2({ x: player.x, y: player.y })
                  .subtract(VectorUtil.getFloorVector(player).scale(-5))
                  .add(VectorUtil.getUpwardVector(player).scale(10));
               return this.mapSprite.hitTestTerrain(
                  locationOfWall.x,
                  locationOfWall.y,
                  VectorUtil.createLocalWall(player, 1),
               );
            },
            rightWallCollision: (player) => {
               const locationOfWall = new Phaser.Math.Vector2({ x: player.x, y: player.y })
                  .subtract(VectorUtil.getFloorVector(player).scale(5))
                  .add(VectorUtil.getUpwardVector(player).scale(10));
               return this.mapSprite.hitTestTerrain(
                  locationOfWall.x,
                  locationOfWall.y,
                  VectorUtil.createLocalWall(player, 1),
               );
            },
            floorCollision: (player) => {
               const locationOfFloor = new Phaser.Math.Vector2({ x: player.x, y: player.y }).subtract(
                  VectorUtil.getFloorVector(player).scale(5),
               );
               return this.mapSprite.hitTestTerrain(
                  locationOfFloor.x,
                  locationOfFloor.y,
                  VectorUtil.createLocalFloor(player, 10),
               );
            },
            ceilingCollision: (player) => {
               const locationOfCeiling = new Phaser.Math.Vector2({ x: player.x, y: player.y })
                  .subtract(VectorUtil.getFloorVector(player).scale(5))
                  .add(VectorUtil.getUpwardVector(player).scale(10));
               return this.mapSprite.hitTestTerrain(
                  locationOfCeiling.x,
                  locationOfCeiling.y,
                  VectorUtil.createLocalFloor(player, 10),
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

      this.graphics = this.add.graphics();
   }

   update(): void {
      if (!this.mapSprite) return;
      this.cameras.main.setRotation(-this.character.rotation);
      this.character.update();

      this.graphics.clear();
      this.graphics.lineStyle(2, 0xff0000, 1);

      this.drawDebug();
   }

   private drawDebug(): void {
      const f = VectorUtil.createLocalWall(this.character, 2);
      const locationOfLeftWall = new Phaser.Math.Vector2({ x: this.character.x, y: this.character.y })
         .subtract(VectorUtil.getFloorVector(this.character).scale(-5))
         .add(VectorUtil.getUpwardVector(this.character).scale(10));
      this.graphics.lineBetween(
         locationOfLeftWall.x,
         locationOfLeftWall.y,
         locationOfLeftWall.x + f[f.length - 1].x,
         locationOfLeftWall.y + f[f.length - 1].y,
      );

      const locationOfRightWall = new Phaser.Math.Vector2({ x: this.character.x, y: this.character.y })
         .subtract(VectorUtil.getFloorVector(this.character).scale(5))
         .add(VectorUtil.getUpwardVector(this.character).scale(10));

      this.graphics.lineBetween(
         locationOfRightWall.x,
         locationOfRightWall.y,
         locationOfRightWall.x + f[f.length - 1].x,
         locationOfRightWall.y + f[f.length - 1].y,
      );

      const g = VectorUtil.createLocalFloor(this.character, 10);

      const locationOfFloor = new Phaser.Math.Vector2({ x: this.character.x, y: this.character.y }).subtract(
         VectorUtil.getFloorVector(this.character).scale(5),
      );

      this.graphics.lineBetween(
         locationOfFloor.x,
         locationOfFloor.y,
         locationOfFloor.x + g[g.length - 1].x,
         locationOfFloor.y + g[g.length - 1].y,
      );

      const locationOfCeiling = new Phaser.Math.Vector2({ x: this.character.x, y: this.character.y })
         .subtract(VectorUtil.getFloorVector(this.character).scale(5))
         .add(VectorUtil.getUpwardVector(this.character).scale(10));

      this.graphics.lineBetween(
         locationOfCeiling.x,
         locationOfCeiling.y,
         locationOfCeiling.x + g[g.length - 1].x,
         locationOfCeiling.y + g[g.length - 1].y,
      );
   }
}
