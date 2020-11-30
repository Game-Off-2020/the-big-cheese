import { Inject, Singleton } from 'typescript-ioc';
import { GameComponent } from './game-component';
import { WindowEventComponent } from '../window/window-event-component';
import { ClientPlayerComponent } from '../player/client-player-component';

@Singleton
export class GameManager {
   constructor(
      @Inject private readonly component: GameComponent,
      @Inject private readonly windowEvent: WindowEventComponent,
      @Inject private readonly player: ClientPlayerComponent,
   ) {
      windowEvent.resize$.subscribe(() => component.refreshScale());
      player.clientInit$.subscribe(() => component.showGameScene());
   }
}
