import { Inject, Singleton } from 'typescript-ioc';
import { Subject } from 'rxjs';
import { JoinRequest } from '../../shared/network/shared-network-model';
import { GameStateStore } from '../../shared/game-state/game-state-store';

@Singleton
export class ClientGameStateComponent {
   private gameStartedSubject = new Subject<JoinRequest>();
   readonly joinGame$ = this.gameStartedSubject.asObservable();

   constructor(@Inject private readonly store: GameStateStore) {
      store.onUpdatedId(GameStateStore.ENTITY_ID).subscribe((gameState) => {
         console.log('GameState', gameState);
      });
   }

   joinGame(userName: string): void {
      this.gameStartedSubject.next({ userName });
   }
}
