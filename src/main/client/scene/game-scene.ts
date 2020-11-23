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
import { PlayerStore } from '../../shared/player/player-store';
import { ClientConfig } from '../config/client-config';
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import { Keys } from '../config/constants';

class GrayscalePipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
   constructor(game: Phaser.Game) {
      super({
         game: game,
         renderer: game.renderer,
         fragShader: `
         #ifdef GL_FRAGMENT_PRECISION_HIGH
         #define highmedp highp
         #else
         #define highmedp mediump
         #endif
         precision highmedp float;
         // Scene buffer
         uniform sampler2D uMainSampler;
         varying vec2 outTexCoord;
         // Effect parameters
         vec2 texSize = vec2(1000.0, 1000.0);
         vec2 pixelSize = vec2(3.0, 3.0);
         uniform float radius;
         uniform float angle;
         void main (void) {
           if ((pixelSize.x > 0.0) || (pixelSize.y > 0.0)) {
             vec2 dxy = pixelSize/texSize;
             vec2 tc = vec2(dxy.x*( floor(outTexCoord.x/dxy.x) + 0.5 ),
                            dxy.y*( floor(outTexCoord.y/dxy.y) + 0.5 )
                           );
             gl_FragColor = texture2D(uMainSampler, tc);
           } else {
             gl_FragColor = texture2D(uMainSampler, outTexCoord);
           }
         }
         `,
      });
   }
}

export class GameScene extends Scene {
   private readonly maxHorizontalSpeed = 3 / ClientConfig.MAP_OUTPUT_SCALE;
   private readonly characterWidth = 10;
   private readonly maxVerticalSpeed = 20 / ClientConfig.MAP_OUTPUT_SCALE;
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
   private readonly playerStore: PlayerStore;

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
         key: Keys.GAME_SCENE,
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
         this.playerStore.onUpdatedId(player.id).subscribe((updatedPlayer) => {
            if (updatedPlayer.position) {
               sprite.tickPosition(updatedPlayer.position);
            }
            if (updatedPlayer.direction) {
               sprite.tickDirection(updatedPlayer.direction);
            }
            if (updatedPlayer.moving !== undefined) {
               sprite.setMoving(updatedPlayer.moving);
            }
         });
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
      const grayscalePipeline = (this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer).addPipeline(
         'Grayscale',
         new GrayscalePipeline(this.game),
      );

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
            onStartMoving: () => {
               this.playerComponent.setMoving(true);
            },
            onStartStanding: () => {
               this.playerComponent.setMoving(false);
            },
            onPositionChanged: (position) => {
               this.playerComponent.setPosition(position);
            },
            onDirectionChanged: (direction) => {
               this.playerComponent.setDirection(direction);
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
      // this.cameras.main.startFollow(this.character);
      // this.cameras.main.zoom = ClientConfig.MAP_OUTPUT_SCALE;
      this.bullets = new Bullets(this);
      this.bulletGroupComponent.setBulletGroup(this.bullets);
      new StarFieldSprite({ scene: this, scale: ClientConfig.MAP_OUTPUT_SCALE });
      this.lava = new LavaFloorSprite({ scene: this, size: 100 });
      this.createdSubject.next(true);
      // this.cameras.main.setRenderToTexture(grayscalePipeline);
   }

   update(): void {
      if (!this.mapSprite) return;
      // this.cameras.main.setRotation(-this.character.rotation);
      this.character.update();
      this.updateOtherPlayers();
   }

   private updateOtherPlayers(): void {
      for (const sprite of this.otherPlayers.values()) {
         sprite.update();
         sprite.setRotation(VectorUtil.getFloorVector(sprite).scale(-1).angle());
      }
   }
}
