import { Inject, Singleton } from 'typescript-ioc';
import { ClientMapComponent } from './client-map-component';
import { ClientNetworkComponent } from '../network/client-network-component';
import { SharedMapManager } from '../../shared/map/shared-map-manager';
import { MapStore } from '../../shared/map/map-store';
import { ClientConfig } from '../config/client-config';
import { filter } from 'rxjs/operators';
import { ClientPlayerComponent } from '../player/client-player-component';
import { VectorUtil } from '../util/vector-util';
import { Destruction } from '../../shared/map/map-model';

@Singleton
export class ClientMapManager extends SharedMapManager {
   constructor(
      @Inject protected readonly component: ClientMapComponent,
      @Inject protected readonly store: MapStore,
      @Inject private readonly network: ClientNetworkComponent,
      @Inject private readonly clientPlayer: ClientPlayerComponent,
   ) {
      super(component, store);
      network.joined$.subscribe((response) => component.initMap(response.map.size, response.map.buffer));
      network.mapUpdate$.subscribe((response) => component.updateMap(response.buffer));
      component.destruction$
         .pipe(
            filter(
               (destruction: Destruction) =>
                  destruction.radius >= ClientConfig.SHAKE_LIMIT &&
                  VectorUtil.distanceTo(destruction.position, clientPlayer.getClient().position) <
                     (window.innerWidth / ClientConfig.MAP_OUTPUT_SCALE) * 1.5,
            ),
         )
         .subscribe((destruction) => component.shake(destruction.radius / ClientConfig.SHAKE_LIMIT));
   }
}
