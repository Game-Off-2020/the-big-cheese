import { Inject, Singleton } from 'typescript-ioc';
import { GameStateStore } from '../../shared/game-state/game-state-store';
import { GameState } from '../../shared/game-state/game-state-model';

@Singleton
export class ServerGameStateComponent {
   constructor(@Inject private readonly store: GameStateStore) {
      store.commit(GameStateStore.ENTITY_ID, {
         moonPercentage: 1,
      });
   }

   setMoonPercentage(moonPercentage: number): void {
      this.store.commit(GameStateStore.ENTITY_ID, { moonPercentage } as GameState);
   }
}
