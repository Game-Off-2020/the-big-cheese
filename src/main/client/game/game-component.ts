import { Singleton } from 'typescript-ioc';
import Phaser, { Game } from 'phaser';
import { BootScene } from '../scene/boot-scene';
import { MainMenuScene } from '../scene/main-menu-scene';
import { GameScene } from '../scene/game-scene';
import { LoadingScene } from '../scene/error-scene';
import { Keys } from '../config/client-constants';
import { fromEvent, Observable } from 'rxjs';
import { HudScene } from '../scene/hud-scene';
import { ScoreBoardScene } from '../scene/score-board-scene';

@Singleton
export class GameComponent {
   private readonly game: Game;
   readonly hidden$: Observable<void>;

   constructor() {
      this.game = new Game({
         type: Phaser.AUTO,
         scale: {
            mode: Phaser.Scale.RESIZE,
            width: window.innerWidth,
            height: window.innerHeight,
         },
         scene: [BootScene, MainMenuScene, GameScene, LoadingScene, HudScene, ScoreBoardScene],
         physics: {
            default: 'arcade',
            arcade: {
               gravity: {
                  x: 0,
                  y: 0,
               },
            },
         },
         parent: 'game',
         backgroundColor: '#000000',
         render: { antialias: false },
         fps: {
            smoothStep: true,
            target: 60,
         },
      });
      this.hidden$ = fromEvent(this.game.events, 'hidden');
   }

   refreshScale(): void {
      this.game.scale.resize(window.innerWidth, window.innerHeight);
      this.game.scale.refresh();
   }

   showGameScene(): void {
      this.game.scene.stop(Keys.MAIN_MENU_SCENE);
      this.game.scene.stop(Keys.LOADING_SCENE);
      this.game.scene.start(Keys.GAME_SCENE);
      this.game.scene.start(Keys.GUI_SCENE);
      this.game.scene.start(Keys.SCORE_BOARD_SCENE);
   }
}
