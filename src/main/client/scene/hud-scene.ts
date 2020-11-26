// https://www.html5gamedevs.com/topic/38009-phaser-3-hud-menu/
import { Keys } from '../config/client-constants';
import { CheeseCounter } from '../ui/cheese-counter';
import { ScoreBoard } from '../ui/score-board';
import { Inject } from 'typescript-ioc';
import { ClientPlayerComponent } from '../player/client-player-component';

export class HudScene extends Phaser.Scene {
   private cheeseCounter?: CheeseCounter;
   private scoreBoard?: ScoreBoard;

   @Inject
   private readonly playerComponent: ClientPlayerComponent;

   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.GUI_SCENE,
      });
      this.playerComponent.clientCheeseCountChanged$.subscribe((cheeseCount) =>
         this.cheeseCounter.setCount(cheeseCount),
      );
   }

   create(): void {
      this.cheeseCounter = new CheeseCounter({
         scene: this,
         count: 99,
      });

      this.scoreBoard = new ScoreBoard({
         scene: this,
      });
   }
}
