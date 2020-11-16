import { Inject, Singleton } from 'typescript-ioc';
import { ClientPlayerComponent } from './client-player-component';
import { GameStateComponent } from '../game-state/game-state-component';
import { ClientNetworkComponent } from '../network/client-network-component';

@Singleton
export class ClientPlayerManager {
   constructor(
      @Inject private readonly component: ClientPlayerComponent,
      @Inject private readonly gameState: GameStateComponent,
      @Inject private readonly network: ClientNetworkComponent,
   ) {
      network.loginResponse$.subscribe((response) => {
         // console.log('My id is ', response.id);
         this.component.setClientPlayer({
            id: response.id,
            name: 'Unnamed',
            position: { x: 0, y: 0 },
         });
      });

      component.clientShooting$.subscribe((shootingOptions) => {
         network.sendShootRequest(shootingOptions);
      });
   }
}
