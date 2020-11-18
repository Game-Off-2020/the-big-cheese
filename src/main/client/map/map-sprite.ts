import * as Phaser from 'phaser';

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

const CHARACTER_HEIGHT = 20;
const CHARACTER_WIDTH = 10;

export class MapSprite extends Phaser.GameObjects.Sprite {
   private terrainTexture: Phaser.Textures.CanvasTexture;
   private radius: number;

   constructor(options: MapSpriteOptions) {
      const terrainTexture = options.scene.textures.addCanvas('terrain', options.canvas);
      super(options.scene, 0, 0, 'terrain');

      this.terrainTexture = terrainTexture;
      this.radius = options.canvas.width / 2;
      const moon = options.scene.textures.get('moon').getSourceImage() as HTMLImageElement;
      options.scene.add.existing(this);
      terrainTexture.context.globalCompositeOperation = 'source-in';
      terrainTexture.draw(0, 0, moon);
   }

   hitTestTerrain(worldX: number, worldY: number, points: Phaser.Geom.Point[]): boolean {
      const localX = worldX + this.radius;
      const localY = worldY + this.radius;

      if (localX < 0 || localY < 0 || localX > this.radius * 2 || localY > this.radius * 2) return false;

      const data = this.terrainTexture.getData(localX, localY, CHARACTER_WIDTH, CHARACTER_HEIGHT);

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
