import { Singleton } from 'typescript-ioc';
import Phaser, { Game } from 'phaser';
import { BootScene } from '../scene/boot-scene';
import { MainMenuScene } from '../scene/main-menu-scene';
import { GameScene } from '../scene/game-scene';
import { JoinResponseStatus } from '../../shared/network/shared-network-model';
import { ErrorScene } from '../scene/error-scene';

@Singleton
export class GameComponent {
   private readonly game: Game;

   constructor() {
      this.game = new Game({
         type: Phaser.AUTO,
         scale: {
            width: window.innerWidth,
            height: window.innerHeight,
         },
         scene: [BootScene, MainMenuScene, GameScene, ErrorScene],
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
   }

   refreshScale(): void {
      this.game.scale.refresh();
   }

   showErrorScreen(status: JoinResponseStatus): void {
      console.log('err');
      this.game.scene.stop('Game'); // TODO: Extract key
      this.game.scene.start('ErrorScreen', { status }); // TODO: Extract key
   }

   showGameScene(): void {
      this.game.scene.start('Game'); // TODO: Extract key
   }
}
