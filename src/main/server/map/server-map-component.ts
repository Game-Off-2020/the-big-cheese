import { Inject, Singleton } from 'typescript-ioc';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { SharedMapComponent } from '../../shared/map/shared-map-component';
import { MapStore } from '../../shared/map/map-store';
import { MapDestruction } from '../../shared/map/map-model';
import { Utils } from '../../shared/util/utils';
import { Vector } from '../../shared/bullet/vector-model';
import { PerlinNoise } from './perlin-noise';

@Singleton
export class ServerMapComponent extends SharedMapComponent {
   private canvas: Canvas;
   protected ctx: CanvasRenderingContext2D;
   protected size: number;
   private data?: DataView;

   constructor(@Inject protected readonly store: MapStore) {
      super(store);
   }

   createMap(radius: number): void {
      this.size = radius * 2;
      this.canvas = createCanvas(this.size, this.size);
      this.ctx = this.canvas.getContext('2d');

      // Base cirlce
      this.ctx.fillStyle = '#ff0000';
      this.ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
      this.ctx.fill();

      // Perlin Noise
      const perlinNoise = new PerlinNoise();
      const noiseCanvas = perlinNoise.generate(this.size / 30);
      const noiseWidth = noiseCanvas.width;
      const noiseHeight = noiseCanvas.height;
      const resizedNoiseCanvas = createCanvas(this.size, this.size);
      const resizedNoiseCtx = resizedNoiseCanvas.getContext('2d');
      resizedNoiseCtx.drawImage(
         noiseCanvas,
         0,
         0,
         noiseWidth,
         noiseHeight,
         0,
         0,
         resizedNoiseCanvas.width,
         resizedNoiseCanvas.height,
      );

      // Mask noise canvas
      const targetView = new DataView(this.ctx.getImageData(0, 0, this.size, this.size).data.buffer);
      const maskView = new DataView(resizedNoiseCtx.getImageData(0, 0, this.size, this.size).data.buffer);

      const MASK_THRESHOLD = 128; // 0-255
      for (let y = 0; y < this.size; y++) {
         for (let x = 0; x < this.size; x++) {
            const offset = 4 * (x + y * this.size);
            const brightness = (maskView.getUint32(offset) >> 24) & 0xff; // Red channel
            if (brightness < MASK_THRESHOLD) {
               targetView.setUint32(offset, 0);
            }
         }
      }

      // Draw masked moon
      const imageData = this.ctx.createImageData(this.size, this.size);
      imageData.data.set(new Uint8ClampedArray(targetView.buffer));
      this.ctx.putImageData(imageData, 0, 0);

      // Moon inner circle
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.fillStyle = '#ff0000';
      this.ctx.arc(radius, radius, radius / 1.1, 0, 2 * Math.PI);
      this.ctx.fill();

      // fs.writeFileSync('perlin.png', this.canvas.toBuffer());
      // console.log('ok');
   }

   getMap(): Buffer {
      return this.canvas.toBuffer();
   }

   getSize(): number {
      return this.size;
   }

   updateData(): void {
      this.data = new DataView(this.ctx.getImageData(0, 0, this.size, this.size).data.buffer);
   }

   //

   getRandomPositionAboveSurface(elevation: number): Vector {
      const angle = (Math.random() * Math.PI) / 2;
      const radius = this.size / 2 + elevation;
      return {
         x: Math.cos(angle) * radius,
         y: Math.sin(angle) * radius,
      };
   }

   destruct(destruction: MapDestruction): void {
      this.store.commit(Utils.generateId(), destruction);
   }

   raycast(x1: number, y1: number, x2: number, y2: number): [number, number] | null {
      // Naive line drawing algorithm see
      // https://www.geeksforgeeks.org/dda-line-generation-algorithm-computer-graphics/
      const dx = x2 - x1;
      const dy = y2 - y1;
      const steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
      const Xinc = dx / steps;
      const Yinc = dy / steps;
      let X = x1;
      let Y = y1;
      for (let i = 0; i <= steps; i++) {
         if (this.hits(X, Y)) {
            return [X, Y];
         }
         X += Xinc;
         Y += Yinc;
      }
      return null;
   }

   private hits(x: number, y: number): boolean {
      return this.getPixelAlpha(x, y) > 0;
   }

   private getPixelAlpha(x: number, y: number): number {
      x = this.getLocal(x);
      y = this.getLocal(y);
      if (Math.abs(x) >= this.size || Math.abs(y) >= this.size || x < 0 || y < 0) {
         return 0;
      }
      const pixelValue = this.data.getUint32(4 * (x + y * this.size));
      // See other values here
      // https://stackoverflow.com/questions/17945972/converting-rgba-values-into-one-integer-in-javascript
      return ((pixelValue & 0xff000000) >>> 24) / 255;
   }
}
