import { Inject } from 'typescript-ioc';

import { Keys } from '../config/client-constants';
import { ScoreboardComponent } from '../player/scoreboard/scoreboard-component';
import { filter } from 'rxjs/operators';
import { ClientGameStateComponent } from '../game-state/client-game-state-component';
import { GameSetScoreboard } from '../ui/game-set-score-board';

export class ScoreBoardScene extends Phaser.Scene {
   private scoreBoard?: GameSetScoreboard;

   @Inject
   private readonly scoreboardComponent: ScoreboardComponent;

   @Inject
   private readonly gameStateComponent: ClientGameStateComponent;

   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.SCORE_BOARD_SCENE,
      });

      this.scoreboardComponent.changed$.pipe(filter(() => !!this.scoreBoard)).subscribe((scoreboard) => {
         this.scoreBoard.setScores(scoreboard);
      });

      this.gameStateComponent.startPlaying$.subscribe(() => {
         this.scene.setVisible(false);
      });

      this.gameStateComponent.finished$.subscribe(() => {
         this.scoreBoard.restartTimer();
         this.scene.setVisible(true);
      });
   }

   create(): void {
      this.scoreBoard = new GameSetScoreboard(this);
   }
}
