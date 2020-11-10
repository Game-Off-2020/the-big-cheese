import { Inject, Singleton } from 'typescript-ioc';
import { GameStateComponent } from '../game-state/game-state-component';
import { GameComponent } from '../game/game-component';
import { NetworkComponent } from './network-component';

@Singleton
export class NetworkManager {
   constructor(
      @Inject private readonly component: NetworkComponent,
      @Inject private readonly gameState: GameStateComponent,
      @Inject private readonly game: GameComponent,
   ) {
      gameState.gameStarted$.subscribe(() => {
         const scene = game.getGameScene();
         scene.playerPositionChanged$.subscribe((position) => {
            console.log(position);
         });
      });
   }
}
