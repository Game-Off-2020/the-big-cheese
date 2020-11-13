import { Inject, Singleton } from 'typescript-ioc';
import { ServerPlayerComponent } from './server-player-component';
import { Player } from '../../shared/player/player-model';
import { PlayerStore } from '../../shared/player/player-store';
import { ServerNetworkComponent } from '../network/server-network-component';

@Singleton
export class ServerPlayerManager {
   constructor(
      @Inject private readonly component: ServerPlayerComponent,
      @Inject private readonly network: ServerNetworkComponent,
      @Inject private readonly playerStore: PlayerStore,
   ) {
      // TODO: When the player connects we need to store it until it sends a login message with its name and settings (room etc)
      // TODO: Now we just create the player as if it had already sent this login message
      network.clientConnectedId$.subscribe((id) => this.addUser(id));
   }

   private addUser(id: string): void {
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
