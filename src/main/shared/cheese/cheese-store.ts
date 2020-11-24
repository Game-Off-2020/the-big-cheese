import { Singleton } from 'typescript-ioc';
import { Store } from '../store/store';
import { Cheese } from './cheese-model';

@Singleton
export class CheeseStore extends Store<Cheese> {
   getId(): string {
      return CheeseStore.name;
   }
}
