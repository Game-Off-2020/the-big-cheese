import { Singleton } from 'typescript-ioc';
import Phaser, { Game } from 'phaser';
import { BootScene } from '../scene/boot-scene';
import { MainMenuScene } from '../scene/main-menu-scene';
import { GameScene } from '../scene/game-scene';

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
         scene: [BootScene, MainMenuScene, GameScene],
         physics: {
            default: 'arcade',
            arcade: {
               debug: true,
            },
         },
         parent: 'game',
         backgroundColor: '#000000',
         render: { antialias: true },
         fps: {
            smoothStep: true,
            target: 60,
         },
      });
   }

   refreshScale(): void {
      this.game.scale.refresh();
   }
}
