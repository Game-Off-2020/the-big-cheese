import { Singleton } from 'typescript-ioc';
import { Store } from '../store/store';
import { MapDestruction } from './map-model';

@Singleton
export class MapStore extends Store<MapDestruction> {
   getId(): string {
      return MapStore.name;
   }

   update(id: string, value: MapDestruction): void {
      super.update(id, value);
      this.remove(id);
   }

   commit(id: string, value: MapDestruction): void {
      super.commit(id, value);
      this.remove(id);
   }
}
