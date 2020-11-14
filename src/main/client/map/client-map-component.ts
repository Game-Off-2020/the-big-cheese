import { Inject, Singleton } from 'typescript-ioc';
import { MapStore } from '../../shared/map/map-store';
import { Subject } from 'rxjs';
import { ImageUtil } from '../util/image-util';
import { SharedMapComponent } from '../../shared/map/shared-map-component';
import { MapDestruction } from '../../shared/map/map-model';

@Singleton
export class ClientMapComponent extends SharedMapComponent {
   private canvas: HTMLCanvasElement;
   protected ctx: CanvasRenderingContext2D;

   private readonly mapLoadedSubject = new Subject<HTMLCanvasElement>();
   readonly mapLoaded$ = this.mapLoadedSubject.pipe();

   private readonly updatedSubject = new Subject<void>();
   readonly updated$ = this.updatedSubject.pipe();

   constructor(@Inject protected readonly store: MapStore) {
      super(store);
   }

   initMap(size: number, buffer: Buffer): void {
      this.canvas = document.createElement('canvas') as HTMLCanvasElement;
      this.canvas.width = size;
      this.canvas.height = size;
      this.ctx = this.canvas.getContext('2d');

      ImageUtil.createImageFromBuffer(buffer).then((image) => {
         this.ctx.drawImage(image, 0, 0);
         this.mapLoadedSubject.next(this.canvas);
      });
   }

   destruct(destruction: MapDestruction): void {
      super.destruct(destruction);
      this.updatedSubject.next();
   }
}
