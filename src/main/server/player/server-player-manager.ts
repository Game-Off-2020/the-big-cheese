import { Inject, Singleton } from 'typescript-ioc';
import { ServerPlayerComponent } from './server-player-component';
import { ServerNetworkComponent } from '../network/server-network-component';

@Singleton
export class ServerPlayerManager {
   constructor(
      @Inject private readonly component: ServerPlayerComponent,
      @Inject private readonly network: ServerNetworkComponent,
   ) {
      // TODO: When the player connects we need to store it until it sends a login message with its name and settings (room etc)
      // TODO: Now we just create the player as if it had already sent this login message
      // network.clientConnectedId$.subscribe((id) => component.addUser(id));
      network.joinRequest$.subscribe((requestMessage) =>
         component.addUser(requestMessage.user, requestMessage.value.userName),
      );
   }
}
