import { Inject, Singleton } from 'typescript-ioc';
import { PlayerComponent } from './player-component';
import { GameStateComponent } from '../game-state/game-state-component';
import { GameComponent } from '../game/game-component';

@Singleton
export class PlayerManager {
   constructor(
      @Inject private readonly component: PlayerComponent,
      @Inject private readonly gameState: GameStateComponent,
      @Inject private readonly game: GameComponent,
   ) {
      gameState.gameStarted$.subscribe(() => {
         this.mockClient();
         this.subscribePlayerPosition();
      });
   }

   private mockClient(): void {
      // TODO: It is only a mock
      const id = Math.round(Math.random() * 1000).toFixed(0);
      this.component.initClientPlayer({
         id,
         name: id,
         position: { x: 100, y: 100 },
      });
   }

   private subscribePlayerPosition(): void {
      this.game
         .getGameScene()
         .playerPositionChanged$.subscribe((position) => this.component.commitClientPosition(position.x, position.y));
   }
}
