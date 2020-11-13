import { Inject, Singleton } from 'typescript-ioc';
import { Player } from '../../shared/player/player-model';
import { PlayerStore } from '../../shared/player/player-store';

@Singleton
export class ServerPlayerComponent {
   constructor(@Inject private readonly playerStore: PlayerStore) {}

   addUser(id: string): void {
      this.playerStore.commit(id, {
         id,
         name: id,
         position: {
            x: 0,
            y: 0,
         },
      } as Player);
   }
}
