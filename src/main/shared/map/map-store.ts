import { Singleton } from 'typescript-ioc';
import { Store } from '../store/store';
import { Destruction } from './map-model';

@Singleton
export class MapStore extends Store<Destruction> {
   getId(): string {
      return MapStore.name;
   }

   update(id: string, value: Destruction): void {
      super.update(id, value);
      this.reset();
   }

   commit(id: string, value: Destruction): void {
      super.commit(id, value);
      this.reset();
   }
}
