import { Inject, Singleton } from 'typescript-ioc';
import { ServerPlayerComponent } from './server-player-component';
import { ServerNetworkComponent } from '../network/server-network-component';

@Singleton
export class ServerPlayerManager {
   constructor(
      @Inject private readonly component: ServerPlayerComponent,
      @Inject private readonly network: ServerNetworkComponent,
   ) {
      network.joinRequest$.subscribe((requestMessage) =>
         component.addUser(requestMessage.user, requestMessage.value.userName),
      );
      network.clientDisconnectedId$.subscribe((userId) => component.removeUser(userId));
   }
}
