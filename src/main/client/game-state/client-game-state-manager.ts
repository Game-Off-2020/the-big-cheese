import { Inject, Singleton } from 'typescript-ioc';
import { ClientGameStateComponent } from './client-game-state-component';
import { ClientNetworkComponent } from '../network/client-network-component';

@Singleton
export class ClientGameStateManager {
   constructor(
      @Inject private readonly component: ClientGameStateComponent,
      @Inject private readonly network: ClientNetworkComponent,
   ) {
      network.disconnected$.subscribe(() => component.leaveGame());
   }
}
