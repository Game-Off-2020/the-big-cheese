import { Inject, Singleton } from 'typescript-ioc';
import { Player } from '../../shared/player/player-model';
import { PlayerStore } from '../../shared/player/player-store';
import { ServerMapComponent } from '../map/server-map-component';

@Singleton
export class ServerPlayerComponent {
   constructor(@Inject private readonly store: PlayerStore, @Inject private readonly map: ServerMapComponent) {}

   addUser(id: string, name: string): void {
      // TODO: Check name availability
      console.log('addUser', id);
      this.store.commit(id, {
         id,
         name,
         position: {
            x: 0,
            y: this.map.getSize() / 2 + 30,
         },
         direction: {
            x: 0,
            y: 0,
         },
         moving: false,
      });
   }

   removeUser(userId: string): void {
      this.store.remove(userId);
   }

   getPlayer(id: string): Player | undefined {
      return this.store.get(id);
   }

   getNrOfPlayers(): number {
      return this.store.getIds().length;
   }
}
