import { Inject, Singleton } from 'typescript-ioc';
import { PlayerComponent } from './player-component';
import { GameStateComponent } from '../game-state/game-state-component';
import { GameComponent } from '../game/game-component';
import { ClientNetworkComponent } from '../network/client-network-component';

@Singleton
export class PlayerManager {
   constructor(
      @Inject private readonly component: PlayerComponent,
      @Inject private readonly gameState: GameStateComponent,
      @Inject private readonly game: GameComponent,
      @Inject private readonly network: ClientNetworkComponent,
   ) {
      network.loginResponse$.subscribe((response) => {
         console.log('My id is ', response.id);
         this.component.initClientPlayer({
            id: response.id,
            name: 'Unnamed',
            position: { x: 0, y: 0 },
         });
         this.subscribePlayerPosition();
      });
   }

   private subscribePlayerPosition(): void {
      this.game
         .getGameScene()
         .playerPositionChanged$.subscribe((position) => this.component.commitClientPosition(position.x, position.y));
   }
}
