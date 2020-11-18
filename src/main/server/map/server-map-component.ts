import { Inject, Singleton } from 'typescript-ioc';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { SharedMapComponent } from '../../shared/map/shared-map-component';
import { MapStore } from '../../shared/map/map-store';
import { MapDestruction } from '../../shared/map/map-model';
import { Utils } from '../../shared/util/utils';

@Singleton
export class ServerMapComponent extends SharedMapComponent {
   private static readonly COLOR_MOON: string = '#7f8c8d';
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

      this.ctx.fillStyle = ServerMapComponent.COLOR_MOON;
      this.ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
      this.ctx.fill();
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

   destruct(destruction: MapDestruction): void {
      this.store.commit(Utils.generateId(), destruction);
   }

   raycast(x1: any, y1: any, x2: number, y2: number): [number, number] | null {
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
      if (Math.abs(x) >= this.size / 2 || Math.abs(y) >= this.size / 2) {
         return 0;
      }
      const pixelValue = this.data.getUint32(4 * (this.getLocal(x) + this.getLocal(y) * this.size));
      // See other values here
      // https://stackoverflow.com/questions/17945972/converting-rgba-values-into-one-integer-in-javascript
      return ((pixelValue & 0xff000000) >>> 24) / 255;
   }
}
