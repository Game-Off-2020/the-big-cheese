import * as Phaser from 'phaser';

import { MapDestruction } from '../../shared/map/map-model';
import { ClientConfig } from '../config/client-config';
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '../player/player-sprite';

interface MapSpriteOptions {
   readonly scene: Phaser.Scene;
   readonly canvas: HTMLCanvasElement;
}

interface Color {
   readonly red: number;
   readonly green: number;
   readonly blue: number;
   readonly alpha: number;
}

export class MapSprite extends Phaser.GameObjects.Sprite {
   private terrainTexture: Phaser.Textures.CanvasTexture;
   private radius: number;
   private dustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

   constructor(options: MapSpriteOptions) {
      const terrainTexture = options.scene.textures.addCanvas('terrain', options.canvas);
      super(options.scene, 0, 0, 'terrain');

      this.terrainTexture = terrainTexture;
      this.radius = options.canvas.width / 2;
      const moon = options.scene.textures.get('moon').getSourceImage() as HTMLImageElement;
      options.scene.add.existing(this);
      terrainTexture.context.globalCompositeOperation = 'source-in';
      terrainTexture.draw(0, 0, moon);

      const particle = options.scene.add.particles('moon-dust-particle');
      this.dustEmitter = particle.createEmitter({
         x: this.x,
         y: this.y,
         speed: { min: -20, max: 20 },
         angle: { min: 0, max: 360 },
         scale: { start: 0, end: 0.4 / ClientConfig.MAP_OUTPUT_SCALE },
         alpha: { start: 1, end: 0, ease: 'Expo.easeIn' },
         blendMode: Phaser.BlendModes.SCREEN,
         gravityY: 0,
         lifespan: 400,
      });
      this.dustEmitter.reserve(1000);
      this.dustEmitter.stop();
      particle.setDepth(100);
   }

   hitTestTerrain(worldX: number, worldY: number, points: Phaser.Geom.Point[]): boolean {
      const localX = Math.round(worldX + this.radius);
      const localY = Math.round(worldY + this.radius);

      if (localX < 0 || localY < 0 || localX > this.radius * 2 || localY > this.radius * 2) return false;

      const data = this.terrainTexture.getData(localX, localY, PLAYER_WIDTH, PLAYER_HEIGHT);

      for (const point of points) {
         if (this.testCollisionWithTerrain(point.x, point.y, data)) {
            return true;
         }
      }
      return false;
   }

   update(): void {
      this.terrainTexture.update();
      super.update();
   }

   emitDust(destruction: MapDestruction): void {
      this.dustEmitter
         .setSpeed({ min: destruction.radius, max: destruction.radius })
         .explode(10, destruction.position.x, destruction.position.y);
   }

   shake(intensity: number): void {
      this.scene.cameras.main.shake(100, intensity);
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
}
