import { Inject, Singleton } from 'typescript-ioc';
import { ServerPlayerComponent } from './server-player-component';
import { ServerNetworkComponent } from '../network/server-network-component';
import { ServerConfig } from '../config/server-config';
import { JoinResponseStatus } from '../../shared/network/shared-network-model';

@Singleton
export class ServerPlayerManager {
   constructor(
      @Inject private readonly component: ServerPlayerComponent,
      @Inject private readonly network: ServerNetworkComponent,
   ) {
      network.joinRequest$.subscribe((requestMessage) => {
         if (component.getNrOfPlayers() < ServerConfig.MAX_NR_OF_PLAYERS) {
            component.add(requestMessage.user, requestMessage.value.userName);
         } else {
            this.sendServerIsFullJoinResponse(requestMessage.user);
         }
      });
      network.clientDisconnectedId$.subscribe((userId) => component.remove(userId));
   }

   private sendServerIsFullJoinResponse(userId: string): void {
      this.network.sendLoginResponse(userId, {
         status: JoinResponseStatus.SERVER_FULL,
      });
   }
}
