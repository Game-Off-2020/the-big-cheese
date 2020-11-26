import { Store } from '../store/store';
import { Player } from './player-model';
import { Singleton } from 'typescript-ioc';

@Singleton
export class PlayerStore extends Store<Player> {
   getId(): string {
      return PlayerStore.name;
   }

   getIds(): string[] {
      return Object.keys(this.getData());
   }
}
