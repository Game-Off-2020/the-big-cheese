import { Inject, Singleton } from 'typescript-ioc';
import { ServerMapComponent } from './server-map-component';
import { SharedMapManager } from '../../shared/map/shared-map-manager';
import { MapStore } from '../../shared/map/map-store';

@Singleton
export class ServerMapManager extends SharedMapManager {
   constructor(@Inject protected readonly component: ServerMapComponent, @Inject protected readonly store: MapStore) {
      super(component, store);
      component.createMap(500);
   }
}
