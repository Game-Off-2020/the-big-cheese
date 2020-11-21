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
      network.joined$.subscribe((response) => {
         this.component.setClientPlayer({
            id: response.userId,
            name: 'Unnamed',
            position: { x: 0, y: 0 },
            direction: { x: 0, y: 0 },
            moving: false,
         });
      });
   }
}
