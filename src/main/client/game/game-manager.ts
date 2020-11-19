import { Inject, Singleton } from 'typescript-ioc';
import { GameComponent } from './game-component';
import { WindowEventComponent } from '../window/window-event-component';
import { ClientNetworkComponent } from '../network/client-network-component';

@Singleton
export class GameManager {
   constructor(
      @Inject private readonly component: GameComponent,
      @Inject private readonly windowEvent: WindowEventComponent,
      @Inject private readonly network: ClientNetworkComponent,
   ) {
      windowEvent.resize$.subscribe(() => component.refreshScale());
      network.joinFailed$.subscribe((status) => component.showErrorScreen(status));
      network.joined$.subscribe(() => component.showGameScene());
   }
}
