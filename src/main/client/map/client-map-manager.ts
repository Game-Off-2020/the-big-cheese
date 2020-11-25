import { Inject, Singleton } from 'typescript-ioc';
import { ClientMapComponent } from './client-map-component';
import { ClientNetworkComponent } from '../network/client-network-component';
import { SharedMapManager } from '../../shared/map/shared-map-manager';
import { MapStore } from '../../shared/map/map-store';

@Singleton
export class ClientMapManager extends SharedMapManager {
   constructor(
      @Inject protected readonly component: ClientMapComponent,
      @Inject protected readonly store: MapStore,
      @Inject private readonly network: ClientNetworkComponent,
   ) {
      super(component, store);
      network.joined$.subscribe((response) => component.initMap(response.map.size, response.map.buffer));
      network.mapUpdate$.subscribe((response) => component.updateMap(response.buffer));
   }
}
