import { MapStore } from './map-store';
import { MapDestruction } from './map-model';

export class SharedMapComponent {
   protected ctx: CanvasRenderingContext2D;
   protected canvasSize = 0;

   constructor(protected readonly store: MapStore) {}

   drawDestruction(destruction: MapDestruction): void {
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.beginPath();
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = '';
      this.aliasedCircle(
         this.ctx,
         this.toLocalCanvas(destruction.position.x),
         this.toLocalCanvas(destruction.position.y),
         destruction.radius,
      );
      this.ctx.fill();
   }

   protected toLocalCanvas(xy: number): number {
      return Math.round(xy + this.canvasSize / 2);
   }

   protected aliasedCircle(ctx: CanvasRenderingContext2D, xc: number, yc: number, radius: number): void {
      // https://stackoverflow.com/questions/45743774/fastest-way-to-draw-and-fill-a-not-anti-aliasing-circle-in-html5canvas
      let x = radius,
         y = 0,
         cd = 0;

      // middle line
      ctx.rect(xc - x, yc, radius << 1, 1);

      while (x > y) {
         cd -= --x - ++y;
         if (cd < 0) cd += x++;
         ctx.rect(xc - y, yc - x, y << 1, 1); // upper 1/4
         ctx.rect(xc - x, yc - y, x << 1, 1); // upper 2/4
         ctx.rect(xc - x, yc + y, x << 1, 1); // lower 3/4
         ctx.rect(xc - y, yc + x, y << 1, 1); // lower 4/4
      }
   }
}
