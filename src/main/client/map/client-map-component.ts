import { Inject, Singleton } from 'typescript-ioc';
import { MapStore } from '../../shared/map/map-store';
import { Subject } from 'rxjs';
import { ImageUtil } from '../util/image-util';
import { SharedMapComponent } from '../../shared/map/shared-map-component';
import { Destruction } from '../../shared/map/map-model';
import { MapSprite } from './map-sprite';
import { ClientPlayerComponent } from '../player/client-player-component';

@Singleton
export class ClientMapComponent extends SharedMapComponent {
   private canvas: HTMLCanvasElement;
   protected ctx: CanvasRenderingContext2D;
   protected canvasSize: number;

   private readonly mapLoadedSubject = new Subject<HTMLCanvasElement>();
   readonly mapLoaded$ = this.mapLoadedSubject.asObservable();

   private readonly updatedSubject = new Subject<void>();
   readonly updated$ = this.updatedSubject.asObservable();

   private readonly reInitSubject = new Subject<void>();
   readonly reInit$ = this.reInitSubject.asObservable();

   private readonly destructionSubject = new Subject<Destruction>();
   readonly destruction$ = this.destructionSubject.asObservable();

   private mapSprite: MapSprite;
   private loaded = false;

   constructor(
      @Inject protected readonly store: MapStore,
      @Inject private readonly clientPlayer: ClientPlayerComponent,
   ) {
      super(store);
   }

   initMap(size: number, buffer: Buffer): void {
      this.canvasSize = size;
      this.canvas = document.createElement('canvas') as HTMLCanvasElement;
      this.canvas.width = size;
      this.canvas.height = size;
      this.ctx = this.canvas.getContext('2d');
      ImageUtil.createImageFromBuffer(buffer).then((image) => {
         this.ctx.drawImage(image, 0, 0);
         this.loaded = true;
         this.mapLoadedSubject.next(this.canvas);
      });
   }

   updateMap(buffer: Buffer): void {
      this.loaded = false;
      ImageUtil.createImageFromBuffer(buffer).then((image) => {
         this.clear();
         this.ctx.globalCompositeOperation = 'source-over';
         this.ctx.drawImage(image, 0, 0);
         this.loaded = true;
         this.reInitSubject.next();
      });
   }

   setMapSprite(mapSprite: MapSprite): void {
      this.mapSprite = mapSprite;
   }

   drawDestruction(destruction: Destruction): void {
      if (!this.loaded) {
         return;
      }
      super.drawDestruction(destruction);
      this.handleDestructionEffect(destruction);
      this.destructionSubject.next(destruction);
      this.updatedSubject.next();
   }

   shake(intensity: number): void {
      if (!this.loaded) {
         return;
      }
      this.mapSprite?.shake(0.0002 * intensity);
   }

   private handleDestructionEffect(destruction: Destruction): void {
      if (!this.loaded) {
         return;
      }
      const volume = this.clientPlayer.getVolume(destruction.position);
      if (volume) {
         this.mapSprite?.destructionEffect(destruction, volume);
      }
   }
}
