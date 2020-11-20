import { MenuButton } from '../ui/menu-button';
import { ClientConfig } from '../config/client-config';
import { Inject } from 'typescript-ioc';
import { GameStateComponent } from '../game-state/game-state-component';

export class MainMenuScene extends Phaser.Scene {
   @Inject
   private gameState: GameStateComponent;

   constructor() {
      super({
         active: false,
         visible: false,
         key: 'MainMenu', // TODO: Extract key
      });
   }

   create(): void {
      if (ClientConfig.AUTO_START) {
         return this.startGame();
      }
      this.add
         .text(100, 50, 'This is a sample main menu. Click the "Start" button below to run your game.', {
            fill: '#FFFFFF',
         })
         .setFontSize(24);

      new MenuButton(this, 100, 150, 'Start Game', () => this.startGame());
      // new MenuButton(this, 100, 250, "Settings", () => console.log("settings button clicked"));
      // new MenuButton(this, 100, 350, "Help", () => console.log("help button clicked"));
   }

   private startGame(): void {
      this.gameState.joinGame('Unknown');
   }
}
