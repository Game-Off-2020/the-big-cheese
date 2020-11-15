import { Inject, Singleton } from 'typescript-ioc';
import { Player } from '../../shared/player/player-model';
import { PlayerStore } from '../../shared/player/player-store';

@Singleton
export class ServerPlayerComponent {
   constructor(@Inject private readonly playerStore: PlayerStore) {}

   addUser(id: string, name: string): void {
      // TODO: Check name availability
      console.log('addUser', id);
      this.playerStore.commit(id, {
         id,
         name,
         position: {
            x: 0,
            y: 0,
         },
      } as Player);
   }
}
