import * as Phaser from 'phaser';

import { Destruction } from '../../shared/map/map-model';
import { Keys } from '../config/client-constants';
import { MapElemSprite } from './map-elem-sprite';
import { ClientConfig } from '../config/client-config';

export interface MapSpriteOptions {
   readonly scene: Phaser.Scene;
   readonly canvas: HTMLCanvasElement;
}

interface Color {
   readonly red: number;
   readonly green: number;
   readonly blue: number;
   readonly alpha: number;
}

export class MapSprite extends Phaser.GameObjects.Container {
   private readonly radius: number;
   private dustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
   private readonly moonTexture: HTMLImageElement;

   private readonly grid: MapElemSprite[] = [];
   private readonly resolution: number;

   constructor(options: MapSpriteOptions) {
      super(options.scene, 0, 0);
      this.radius = options.canvas.width / 2;
      this.moonTexture = options.scene.textures.get(Keys.MOON).getSourceImage() as HTMLImageElement;
      options.scene.add.existing(this);

      const particle = options.scene.add.particles(Keys.SMOKE_FIRE);
      this.dustEmitter = particle.createEmitter({
         x: this.x,
         y: this.y,
         speed: { min: -20, max: 20 },
         angle: { min: 0, max: 360 },
         scale: { start: 0, end: 1.2 },
         alpha: { start: 1, end: 0, ease: 'Expo.easeIn' },
         gravityY: 0,
         lifespan: 200,
         tint: 0xffffff,
      });
      this.dustEmitter.reserve(100);
      this.dustEmitter.stop();
      particle.setDepth(100);

      this.resolution = 1;
      const size = (2 * this.radius) / this.resolution;
      for (let i = 0; i < this.resolution * this.resolution; i++) {
         const canvas = document.createElement('canvas') as HTMLCanvasElement;
         canvas.width = size;
         canvas.height = size;
         const texture = options.scene.textures.addCanvas(Keys.TERRAIN + '_' + i, canvas);
         const elem = new MapElemSprite({
            scene: options.scene,
            x: size * (i % this.resolution),
            y: size * Math.floor(i / this.resolution),
            width: size,
            height: size,
            texture: Keys.TERRAIN + '_' + i,
            radius: this.radius,
            sourceCanvas: options.canvas,
         });
         this.grid.push(elem);
         options.scene.add.existing(elem);
      }
      this.drawMoonTextureOverMask();
   }

   hitTestTerrain(worldX: number, worldY: number, points: Phaser.Geom.Point[]): boolean {
      const localX = Math.round(worldX + this.radius);
      const localY = Math.round(worldY + this.radius);

      if (localX < 0 || localY < 0 || localX > this.radius * 2 || localY > this.radius * 2) return false;
      /*
      const x1 = localX;
      const x2 = localX + PLAYER_WIDTH;
      const y1 = localY;
      const y2 = localY + PLAYER_HEIGHT;
      for (let gridY = Math.floor(y1 / this.resolution); gridY <= Math.floor(y2 / this.resolution); gridY++) {
         for (let gridX = Math.floor(x1 % this.resolution); gridX <= Math.floor(x2 % this.resolution); gridX++) {
            this.grid[gridX + this.resolution * gridY].needsUpdate = true;
         }
      }
      const data = this.terrainTexture.getData(localX, localY, PLAYER_WIDTH, PLAYER_HEIGHT);
*/

      const size = (2 * this.radius) / this.resolution;
      for (const point of points) {
         // TODO: Check alpha at point
         const x = Math.floor(point.x + localX);
         const y = Math.floor(point.y + localY);
         const gridX = Math.floor(x / size);
         const gridY = Math.floor(y / size);
         const elem = this.grid[gridX + gridY * this.resolution];
         if (elem?.getAlpha(x, y) > 0) {
            return true;
         }
         //if (this.testCollisionWithTerrain(point.x, point.y, data)) {
         //   return true;
         //}
      }
      return false;
   }

   updateDestructions(destructions: Destruction[]): void {
      const size = (2 * ClientConfig.MOON_RADIUS) / this.resolution;
      destructions.forEach((destruction) => {
         const x1 = destruction.position.x - destruction.radius;
         const x2 = destruction.position.x + destruction.radius + this.radius;
         const y1 = destruction.position.y - destruction.radius + this.radius;
         const y2 = destruction.position.y + destruction.radius + this.radius;
         for (let gridY = Math.floor(y1 / size); gridY <= Math.floor(y2 / size); gridY++) {
            for (let gridX = Math.floor(x1 / size); gridX <= Math.floor(x2 / size); gridX++) {
               const elem = this.grid[gridX + this.resolution * gridY];
               if (elem) {
                  elem.needsUpdate = true;
               }
            }
         }
      });
      // TODO: Update elements inside frame
      this.grid.forEach((elem) => elem.update());
   }

   destructionEffect(destruction: Destruction, volume: number): void {
      this.dustEmitter
         .setScale({ start: 0, end: destruction.radius / 5 })
         .setSpeed({ min: destruction.radius, max: destruction.radius })
         .explode(1, destruction.position.x, destruction.position.y);

      this.scene.sound
         .add(Keys.MOON_IMPACT, {
            volume,
            detune: 100 * Math.random() * 2 - 1,
         })
         .play();
   }

   shake(intensity: number): void {
      this.scene.cameras.main.shake(100, intensity);
   }

   drawMoonTextureOverMask(): void {
      this.grid.forEach((elem) => elem.drawOver(this.moonTexture));
   }
}
