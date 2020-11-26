import { Inject, Singleton } from 'typescript-ioc';
import { GameComponent } from './game-component';
import { WindowEventComponent } from '../window/window-event-component';
import { ClientNetworkComponent } from '../network/client-network-component';
import { ClientPlayerComponent } from '../player/client-player-component';
import { filter } from 'rxjs/operators';

@Singleton
export class GameManager {
   constructor(
      @Inject private readonly component: GameComponent,
      @Inject private readonly windowEvent: WindowEventComponent,
      @Inject private readonly network: ClientNetworkComponent,
      @Inject private readonly player: ClientPlayerComponent,
   ) {
      windowEvent.resize$.subscribe(() => component.refreshScale());
      network.joinFailed$.subscribe((status) => component.showErrorScreen(status));
      player.clientInit$.subscribe(() => component.showGameScene());
      component.hidden$.pipe(filter(() => network.isJoined())).subscribe(() => document.location.reload());
   }
}
