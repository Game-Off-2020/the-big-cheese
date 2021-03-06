import { Inject, Singleton } from 'typescript-ioc';
import { ServerPlayerComponent } from './server-player-component';
import { ServerNetworkComponent } from '../network/server-network-component';
import { ServerConfig } from '../config/server-config';
import { JoinResponseStatus } from '../../shared/network/shared-network-model';
import { ServerCheeseComponent } from '../cheese/server-cheese-component';
import { ServerBulletComponent } from '../bullet/server-bullet-component';
import { ServerGameStateComponent } from '../game-state/server-game-state-component';
import { CheeseType } from '../../shared/cheese/cheese-model';

@Singleton
export class ServerPlayerManager {
   constructor(
      @Inject private readonly component: ServerPlayerComponent,
      @Inject private readonly network: ServerNetworkComponent,
      @Inject private readonly cheese: ServerCheeseComponent,
      @Inject private readonly bullet: ServerBulletComponent,
      @Inject private readonly gameState: ServerGameStateComponent,
   ) {
      network.joinRequest$.subscribe((requestMessage) => {
         if (component.getNrOfPlayers() < ServerConfig.MAX_NR_OF_PLAYERS) {
            const name = requestMessage.value?.userName?.trim();
            if (requestMessage.user && name.length) {
               component.add(requestMessage.user, name);
            }
         } else {
            this.sendServerIsFullJoinResponse(requestMessage.user);
         }
      });
      network.clientDisconnectedId$.subscribe((playerId) => component.remove(playerId));
      cheese.pickup$.subscribe((pickup) => {
         switch (pickup.type) {
            case CheeseType.CHEESE:
               component.addCheese(pickup.playerId);
               break;
            case CheeseType.DOUBLE_BARREL:
               component.enableDoubleBarrel(pickup.playerId);
               break;
            case CheeseType.CHEESE_DOUBLE:
               component.doubleCheese(pickup.playerId);
               break;
            case CheeseType.CHEESE_HALF:
               component.halfCheese(pickup.playerId);
               break;
         }
      });
      setTimeout(() => {
         // Need to subscribe after ServerCheeseManager lol
         bullet.damage$.subscribe((damage) => component.dealDamage(damage));
      }, 10);
      gameState.startPlaying$.subscribe(() => {
         component.setPlayersCanMove(true);
         component.resetPlayers();
      });
      gameState.finished$.subscribe(() => component.setPlayersCanMove(false));
   }

   private sendServerIsFullJoinResponse(userId: string): void {
      this.network.sendLoginResponse(userId, {
         status: JoinResponseStatus.SERVER_FULL,
      });
   }
}
