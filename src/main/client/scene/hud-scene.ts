// https://www.html5gamedevs.com/topic/38009-phaser-3-hud-menu/
import { Keys } from '../config/client-constants';
import { CheeseCounter } from '../ui/cheese-counter';
import { ScoreBoard } from '../ui/score-board';

export class HudScene extends Phaser.Scene {
   private cheeseCounter?: CheeseCounter;
   private scoreBoard?: ScoreBoard;

   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.GUI_SCENE,
      });
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

   update(): void {
      this.cheeseCounter.update();
      this.scoreBoard.update();
   }
}
