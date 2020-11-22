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
         name: this.getUniqueName(name),
         position: this.map.getRandomPositionAboveSurface(30),
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

   private getUniqueName(name: string): string {
      const playerWithThisName = Array.from(Object.values(this.store.getData())).find((player) => player.name === name);
      if (playerWithThisName) {
         const nameSplit = name.split(' ');
         if (nameSplit.length > 1) {
            let nameEndingNumber = parseInt(nameSplit[nameSplit.length - 1]);
            if (Number.isFinite(nameEndingNumber)) {
               nameEndingNumber++;
               nameSplit[nameSplit.length - 1] = nameEndingNumber.toString();
               return this.getUniqueName(nameSplit.join(' '));
            }
         }
         nameSplit.push('1');
         return this.getUniqueName(nameSplit.join(' '));
      }
      return name;
   }
}
