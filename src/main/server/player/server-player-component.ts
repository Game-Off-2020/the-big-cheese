import { Inject, Singleton } from 'typescript-ioc';
import { Player } from '../../shared/player/player-model';
import { PlayerStore } from '../../shared/player/player-store';
import { ServerMapComponent } from '../map/server-map-component';

@Singleton
export class ServerPlayerComponent {
   constructor(@Inject private readonly store: PlayerStore, @Inject private readonly map: ServerMapComponent) {}

   addUser(id: string, name: string): void {
      this.store.commit(id, {
         id,
         name, // TODO: Check name availability and add number at the end if taken
         position: this.map.getRandomPositionAboveSurface(30),
         direction: {
            x: 0,
            y: 0,
         },
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
