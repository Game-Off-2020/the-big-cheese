import { MapStore } from './map-store';
import { MapDestruction } from './map-model';

export class SharedMapComponent {
   protected ctx: CanvasRenderingContext2D;
   protected size = 0;

   constructor(protected readonly store: MapStore) {}

   drawDestruction(destruction: MapDestruction): void {
      this.ctx.beginPath();
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = '';
      this.ctx.arc(
         this.getLocal(destruction.position.x),
         this.getLocal(destruction.position.y),
         destruction.radius,
         0,
         2 * Math.PI,
      );
      this.ctx.closePath();
      this.ctx.fill();
   }

   protected getLocal(xy: number): number {
      return Math.round(xy + this.size / 2);
   }
}
