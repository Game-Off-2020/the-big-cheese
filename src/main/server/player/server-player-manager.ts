import { Inject, Singleton } from 'typescript-ioc';
import { ServerPlayerComponent } from './server-player-component';
import { ServerNetworkComponent } from '../network/server-network-component';
import { ServerConfig } from '../config/server-config';
import { JoinResponseStatus } from '../../shared/network/shared-network-model';
import { ServerCheeseComponent } from '../cheese/server-cheese-component';
import { ServerBulletComponent } from '../bullet/server-bullet-component';

@Singleton
export class ServerPlayerManager {
   constructor(
      @Inject private readonly component: ServerPlayerComponent,
      @Inject private readonly network: ServerNetworkComponent,
      @Inject private readonly cheese: ServerCheeseComponent,
      @Inject private readonly bullet: ServerBulletComponent,
   ) {
      network.joinRequest$.subscribe((requestMessage) => {
         if (component.getNrOfPlayers() < ServerConfig.MAX_NR_OF_PLAYERS) {
            component.add(requestMessage.user, requestMessage.value.userName);
         } else {
            this.sendServerIsFullJoinResponse(requestMessage.user);
         }
      });
      network.clientDisconnectedId$.subscribe((playerId) => component.remove(playerId));
      cheese.pickup$.subscribe((playerId) => component.addCheese(playerId));
      setTimeout(() => {
         // Need to subscribe after ServerCheeseManager lol
         bullet.damage$.subscribe((damage) => component.dealDamage(damage));
      }, 10);
   }

   private sendServerIsFullJoinResponse(userId: string): void {
      this.network.sendLoginResponse(userId, {
         status: JoinResponseStatus.SERVER_FULL,
      });
   }
}
