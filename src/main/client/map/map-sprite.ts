import * as Phaser from 'phaser';

import { Destruction } from '../../shared/map/map-model';
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '../player/player-sprite';
import { Keys } from '../config/client-constants';

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
   private readonly radius: number;
   private dustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
   private readonly moonTexture: HTMLImageElement;

   constructor(options: MapSpriteOptions) {
      const terrainTexture = options.scene.textures.addCanvas(Keys.TERRAIN, options.canvas);
      super(options.scene, 0, 0, Keys.TERRAIN);

      this.terrainTexture = terrainTexture;
      this.radius = options.canvas.width / 2;
      this.moonTexture = options.scene.textures.get(Keys.MOON).getSourceImage() as HTMLImageElement;
      options.scene.add.existing(this);
      this.drawMoonTextureOverMask();

      const particle = options.scene.add.particles(Keys.SMOKE_FIRE);
      this.dustEmitter = particle.createEmitter({
         x: this.x,
         y: this.y,
         speed: { min: -20, max: 20 },
         angle: { min: 0, max: 360 },
         scale: { start: 0, end: 1.2 },
         alpha: { start: 1, end: 0, ease: 'Expo.easeIn' },
         blendMode: Phaser.BlendModes.SCREEN,
         gravityY: 0,
         lifespan: 200,
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

   destructionEffect(destruction: Destruction, volume: number): void {
      this.dustEmitter
         .setScale({ start: 0, end: destruction.radius / 5 })
         .setSpeed({ min: destruction.radius, max: destruction.radius })
         .explode(5, destruction.position.x, destruction.position.y);

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
      this.terrainTexture.context.globalCompositeOperation = 'source-in';
      this.terrainTexture.draw(0, 0, this.moonTexture);
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
