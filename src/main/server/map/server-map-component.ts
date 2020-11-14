import { Inject, Singleton } from 'typescript-ioc';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { SharedMapComponent } from '../../shared/map/shared-map-component';
import { ServerMapStore } from './server-map-store';

@Singleton
export class ServerMapComponent extends SharedMapComponent {
   private static readonly COLOR_MOON: string = '#7f8c8d';
   private canvas: Canvas;
   protected ctx: CanvasRenderingContext2D;
   private size: number;

   constructor(@Inject protected readonly store: ServerMapStore) {
      super(store);
      setInterval(() => {
         store.commit((Math.random() * 1000000).toFixed(0), {
            position: {
               x: Math.random() * 300,
               y: Math.random() * 300,
            },
            radius: Math.random() * 20 + 10,
         });
      }, 1000);
   }

   createMap(radius: number): void {
      this.size = radius * 2;
      this.canvas = createCanvas(radius * 2, radius * 2);
      this.ctx = this.canvas.getContext('2d');

      this.ctx.fillStyle = ServerMapComponent.COLOR_MOON;
      this.ctx.arc(this.size / 2, this.size / 2, radius, 0, 2 * Math.PI);
      this.ctx.fill();
   }

   getMap(): Buffer {
      return this.canvas.toBuffer();
   }

   getSize(): number {
      return this.size;
   }
}
