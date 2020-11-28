import { Keys } from '../config/client-constants';
import { CheeseCounter } from '../ui/cheese-counter';
import { ScoreBoard } from '../ui/score-board';
import { Inject } from 'typescript-ioc';
import { ClientPlayerComponent } from '../player/client-player-component';
import { AmmoCounter } from '../ui/ammo-counter';
import { ClientConfig } from '../config/client-config';
import { ScoreboardComponent } from '../player/scoreboard/scoreboard-component';
import { filter } from 'rxjs/operators';
import { MoonPercentageIndicator } from '../ui/moon-percentage-indicator';
import { ClientGameStateComponent } from '../game-state/client-game-state-component';

// https://www.html5gamedevs.com/topic/38009-phaser-3-hud-menu/
export class HudScene extends Phaser.Scene {
   private scoreBoard?: ScoreBoard;
   private cheeseCounter?: CheeseCounter;
   private ammoCounter?: AmmoCounter;
   private moonPercentageIndicator?: MoonPercentageIndicator;

   @Inject
   private readonly scoreboardComponent: ScoreboardComponent;

   @Inject
   private readonly playerComponent: ClientPlayerComponent;

   @Inject
   private readonly gameStateComponent: ClientGameStateComponent;

   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.GUI_SCENE,
      });
      this.playerComponent.clientCheeseCountChanged$.subscribe((cheeseCount) => {
         this.cheeseCounter.setCount(cheeseCount);
      });
      this.scoreboardComponent.changed$.pipe(filter(() => !!this.scoreBoard)).subscribe((scoreboard) => {
         this.scoreBoard.setScoreboard(scoreboard);
      });
      this.playerComponent.ammoChanged$.subscribe((ammo) => {
         this.ammoCounter.setAmmo(Math.floor(ammo));
      });
      this.playerComponent.doubleBarrelChanged$.subscribe((doubleBarrel) => {
         this.ammoCounter.setGunType(doubleBarrel ? Keys.DOUBLE_BARREL : Keys.BASIC_GUN);
      });
      this.gameStateComponent.moonPercentageChanged$.subscribe((percentage) => {
         if (this.moonPercentageIndicator) {
            this.moonPercentageIndicator.destroy();
         }
         this.moonPercentageIndicator = new MoonPercentageIndicator({ scene: this, percentage });
      });
   }

   create(): void {
      this.scoreBoard = new ScoreBoard(this);

      this.cheeseCounter = new CheeseCounter({
         scene: this,
         count: 0,
      });

      this.ammoCounter = new AmmoCounter(this, ClientConfig.MAX_AMMO);
   }
}
