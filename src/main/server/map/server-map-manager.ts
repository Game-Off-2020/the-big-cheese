import { Inject, Singleton } from 'typescript-ioc';
import { ServerMapComponent } from './server-map-component';
import { SharedMapManager } from '../../shared/map/shared-map-manager';
import { MapStore } from '../../shared/map/map-store';
import { ServerConfig } from '../config/server-config';
import { ServerBulletComponent } from '../bullet/server-bullet-component';

@Singleton
export class ServerMapManager extends SharedMapManager {
   constructor(
      @Inject protected readonly component: ServerMapComponent,
      @Inject protected readonly store: MapStore,
      @Inject private readonly bullet: ServerBulletComponent,
   ) {
      super(component, store);
      component.createMap(ServerConfig.MOON_RADIUS);
      bullet.damage$.subscribe((destruction) => component.destruct(destruction));
   }
}
