import { Singleton } from 'typescript-ioc';
import { MapStore } from '../../shared/map/map-store';
import { MapDestruction } from '../../shared/map/map-model';

@Singleton
export class ServerMapStore extends MapStore {
   constructor() {
      super();
   }

   commit(id: string, value: MapDestruction): void {
      super.commit(id, value);
      this.remove(id);
   }
}
