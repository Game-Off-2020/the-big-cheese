import { MapStore } from './map-store';
import { MapDestruction } from './map-model';

export class SharedMapComponent {
   protected ctx: CanvasRenderingContext2D;

   constructor(protected readonly store: MapStore) {}

   destruct(destruction: MapDestruction): void {
      this.ctx.beginPath();
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = '';
      this.ctx.arc(destruction.position.x, destruction.position.y, destruction.radius, 0, 2 * Math.PI);
      this.ctx.closePath();
      this.ctx.fill();
   }
}
