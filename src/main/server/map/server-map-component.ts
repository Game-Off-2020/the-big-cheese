import { Inject, Singleton } from 'typescript-ioc';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { SharedMapComponent } from '../../shared/map/shared-map-component';
import { MapStore } from '../../shared/map/map-store';

@Singleton
export class ServerMapComponent extends SharedMapComponent {
   private static readonly COLOR_MOON: string = '#7f8c8d';
   private canvas: Canvas;
   protected ctx: CanvasRenderingContext2D;
   private size: number;

   constructor(@Inject protected readonly store: MapStore) {
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
}
