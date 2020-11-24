import { MenuButton } from '../ui/menu-button';
import { ClientConfig } from '../config/client-config';
import { Inject } from 'typescript-ioc';
import { GameStateComponent } from '../game-state/game-state-component';
import { Utils } from '../../shared/util/utils';
import { Keys } from '../config/constants';
import { StarFieldSprite } from './star-field-sprite';
import { InputBox } from '../ui/input-box';
import { ServerButton } from '../ui/server-button';
import { ServerConfig } from '../../server/config/server-config';
import { TextLink } from '../ui/text-link';

export class MainMenuScene extends Phaser.Scene {
   @Inject
   private gameState: GameStateComponent;

   private selectedServer: ServerConfig;
   private serverButtons: ServerButton[];
   private joinGameButton: MenuButton;
   private nameInput: InputBox;

   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.MAIN_MENU_SCENE,
      });
   }

   create(): void {
      if (ClientConfig.AUTO_START) {
         return this.startGame();
      }

      new StarFieldSprite({ scene: this, scale: 1 });

      const logo = this.add.image(this.game.scale.width / 2, this.game.scale.height / 2 - 250, Keys.LOGO).setScale(0.5);

      const gameOffText = new TextLink({
         scene: this,
         x: this.game.scale.width - 30,
         y: this.game.scale.height - 30,
         text: 'A Game Off 2020 Entry',
         link: 'https://itch.io/jam/game-off-2020',
         origin: { x: 1, y: 1 },
         style: {
            color: '#FFF',
            fontSize: '16px',
         },
      });

      const creditsText = new TextLink({
         scene: this,
         x: 30,
         y: this.game.scale.height - 30,
         text: 'Made by Barnabas and Dolan. Source on GitHub',
         link: 'https://github.com/Game-Off-2020/all',
         origin: { x: 0, y: 1 },
         style: {
            color: '#FFF',
            fontSize: '16px',
         },
      });

      this.nameInput = new InputBox({
         scene: this,
         x: this.game.scale.width / 2,
         y: this.game.scale.height / 2,
         placeholder: 'Enter your name here',
      });

      const buttonWidth = 200;

      this.serverButtons = ClientConfig.SERVER_HOSTS.map(
         (host, i) =>
            new ServerButton({
               scene: this,
               x:
                  this.game.scale.width / 2 +
                  buttonWidth * i -
                  ((ClientConfig.SERVER_HOSTS.length - 1) * buttonWidth) / 2,
               y: this.game.scale.height / 2 + 150,
               text: host.name,
               subText: '0/40',
               serverConfig: ClientConfig.SERVER_HOSTS[i],
               onClick: () => {
                  this.selectedServer = ClientConfig.SERVER_HOSTS[i];
               },
               colors: {
                  label: {
                     over: '#000000',
                     out: '#FFFFFF',
                     down: '#BBBBBB',
                  },
                  rectangle: {
                     over: 0x636363,
                     out: 0x888888,
                     down: 0x444444,
                  },
               },
            }),
      );

      this.joinGameButton = new MenuButton({
         scene: this,
         x: this.game.scale.width / 2,
         y: this.game.scale.height / 2 + 300,
         text: 'Join Game',
         onClick: () => {
            if (!this.selectedServer || this.nameInput.getValue().length === 0) {
               return;
            }

            this.startGame();
         },
         colors: {
            label: {
               over: '#000000',
               out: '#FFFFFF',
               down: '#BBBBBB',
               disabled: '#FFFFFF',
            },
            rectangle: {
               over: 0xffffff,
               out: 0x4287f5,
               down: 0x444444,
               disabled: 0x888888,
            },
         },
      });

      this.scale.on(
         'resize',
         (gameSize: Phaser.Structs.Size) => {
            const width = gameSize.width;
            const height = gameSize.height;

            this.cameras.resize(width, height);
            logo.setPosition(gameSize.width / 2, gameSize.height / 2 - 250);
            this.joinGameButton.setPosition(gameSize.width / 2, gameSize.height / 2 + 300);
            this.nameInput.setPosition(gameSize.width / 2, gameSize.height / 2);

            for (let i = 0; i < this.serverButtons.length; i++) {
               this.serverButtons[i].setPosition(
                  gameSize.width / 2 + buttonWidth * i - ((this.serverButtons.length - 1) * buttonWidth) / 2,
                  gameSize.height / 2 + 150,
               );
            }

            gameOffText.setPosition(this.game.scale.width - 30, this.game.scale.height - 30);
            creditsText.setPosition(30, this.game.scale.height - 30);
         },
         this,
      );
   }

   update(): void {
      for (const button of this.serverButtons) {
         button.update(this.selectedServer);
         this.joinGameButton.update(!this.selectedServer || this.nameInput.getValue().length === 0);
      }
   }

   private startGame(): void {
      this.gameState.joinGame(Utils.generateId());
   }
}
