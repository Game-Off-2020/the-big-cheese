import { SharedMapComponent } from './shared-map-component';
import { MapStore } from './map-store';

export abstract class SharedMapManager {
   protected constructor(protected readonly component: SharedMapComponent, protected readonly store: MapStore) {
      store.added$.subscribe((entity) => component.drawDestruction(entity.value));
   }
}
