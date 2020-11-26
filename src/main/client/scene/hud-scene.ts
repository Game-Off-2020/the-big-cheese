// https://www.html5gamedevs.com/topic/38009-phaser-3-hud-menu/
import { Keys } from '../config/client-constants';
import { CheeseCounter } from '../ui/cheese-counter';
import { ScoreBoard } from '../ui/score-board';
import { Inject } from 'typescript-ioc';
import { ClientPlayerComponent } from '../player/client-player-component';
import { AmmoCounter } from '../ui/ammo-counter';
import { ClientConfig } from '../config/client-config';

export class HudScene extends Phaser.Scene {
   private scoreBoard?: ScoreBoard;
   private cheeseCounter?: CheeseCounter;
   private ammoCounter?: AmmoCounter;

   @Inject
   private readonly playerComponent: ClientPlayerComponent;

   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.GUI_SCENE,
      });
      this.playerComponent.clientCheeseCountChanged$.subscribe((cheeseCount) => {
         this.cheeseCounter.setCount(cheeseCount);
      });
      this.playerComponent.ammoChanged$.subscribe((ammo) => {
         this.ammoCounter.setAmmo(Math.floor(ammo));
      });
   }

   create(): void {
      this.scoreBoard = new ScoreBoard({
         scene: this,
      });

      this.cheeseCounter = new CheeseCounter({
         scene: this,
         count: 99,
      });

      this.ammoCounter = new AmmoCounter(this, ClientConfig.MAX_AMMO);
   }
}
