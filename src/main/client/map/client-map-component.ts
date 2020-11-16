import { Inject, Singleton } from 'typescript-ioc';
import { MapStore } from '../../shared/map/map-store';
import { Subject } from 'rxjs';
import { ImageUtil } from '../util/image-util';
import { SharedMapComponent } from '../../shared/map/shared-map-component';
import { MapDestruction } from '../../shared/map/map-model';

@Singleton
export class ClientMapComponent extends SharedMapComponent {
   protected ctx: CanvasRenderingContext2D;

   private readonly mapLoadedSubject = new Subject<HTMLCanvasElement>();
   readonly mapLoaded$ = this.mapLoadedSubject.asObservable();

   private readonly updatedSubject = new Subject<void>();
   readonly updated$ = this.updatedSubject.asObservable();

   constructor(@Inject protected readonly store: MapStore) {
      super(store);
   }

   initMap(size: number, buffer: Buffer): void {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      canvas.width = size;
      canvas.height = size;
      this.ctx = canvas.getContext('2d');

      ImageUtil.createImageFromBuffer(buffer).then((image) => {
         this.ctx.drawImage(image, 0, 0);
         this.mapLoadedSubject.next(canvas);
      });
   }

   destruct(destruction: MapDestruction): void {
      super.destruct(destruction);
      this.updatedSubject.next();
   }
}
