import { Singleton } from 'typescript-ioc';
import { Store } from '../store/store';
import { GameState } from './game-state-model';

@Singleton
export class GameStateStore extends Store<GameState> {
   static readonly ENTITY_ID = 'state';

   getId(): string {
      return GameStateStore.name;
   }
}
