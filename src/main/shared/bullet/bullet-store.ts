import { Singleton } from 'typescript-ioc';
import { Bullet } from './bullet-model';
import { Store } from '../store/store';

@Singleton
export class BulletStore<T = Bullet> extends Store<T> {
   constructor() {
      super();
   }

   getId(): string {
      return BulletStore.name;
   }
}
