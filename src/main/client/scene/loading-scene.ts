import { MenuButton } from '../ui/menu-button';
import { JoinResponseStatus } from '../../shared/network/shared-network-model';
import { Keys } from '../config/client-constants';
import { ClientNetworkComponent } from '../network/client-network-component';
import { Inject } from 'typescript-ioc';
import { LoadingSpinner } from '../ui/loading-spinner';
import { StarFieldSprite } from './star-field-sprite';

export class LoadingScene extends Phaser.Scene {
   @Inject
   private readonly network: ClientNetworkComponent;

   private loadingSpinner: LoadingSpinner;
   private backButton: MenuButton;
   private loadingText: Phaser.GameObjects.Text;
   private errorText: Phaser.GameObjects.Text;

   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.LOADING_SCENE,
      });
   }

   create(): void {
      new StarFieldSprite({ scene: this, scale: 1 });

      this.errorText = this.add
         .text(this.game.scale.width / 2, this.game.scale.height / 2, '', {
            color: '#FFF',
            fontSize: '40px',
            fontFamily: 'CactusStory',
            stroke: '#000000',
            strokeThickness: 6,
         })
         .setOrigin(0.5, 0.5)
         .setVisible(false);

      this.loadingText = this.add
         .text(this.game.scale.width / 2, this.game.scale.height / 2 - 150, 'Loading', {
            color: '#FFF',
            fontSize: '100px',
            fontFamily: 'CactusStory',
            stroke: '#000000',
            strokeThickness: 7,
         })
         .setOrigin(0.5, 1);

      this.backButton = new MenuButton({
         scene: this,
         x: this.game.scale.width / 2,
         y: this.game.scale.height / 2 + 200,
         text: 'Try Again',
         onClick: () => {
            this.game.scene.stop(Keys.LOADING_SCENE);
            this.game.scene.start(Keys.MAIN_MENU_SCENE);
         },
         colors: {
            label: {
               over: '#FFFFFF',
               out: '#FFFFFF',
               down: '#BBBBBB',
               disabled: '',
            },
            rectangle: {
               over: 0x636363,
               out: 0x4287f5,
               down: 0x444444,
               disabled: 0,
            },
         },
      });
      this.backButton.setVisible(false);

      this.loadingSpinner = new LoadingSpinner({
         scene: this,
         x: this.game.scale.width / 2,
         y: this.game.scale.height / 2,
      });

      this.scale.on(
         'resize',
         (gameSize: Phaser.Structs.Size) => {
            this.loadingSpinner.setPosition(gameSize.width / 2, gameSize.height / 2);
            this.backButton.setPosition(gameSize.width / 2, gameSize.height / 2 + 200);
            this.loadingText.setPosition(this.game.scale.width / 2, this.game.scale.height / 2 - 150);
         },
         this,
      );

      this.network.joinFailed$.subscribe((status) => {
         console.log(status);
         this.showErrorScreen(status);
      });
   }

   showErrorScreen(joinResponseStatus: JoinResponseStatus): void {
      this.loadingText.setText('Oops');
      this.errorText.setText(this.getErrorMessage(joinResponseStatus));
      this.errorText.setVisible(true);
      this.backButton.setVisible(true);
      this.loadingSpinner.setVisible(false);
   }

   update(): void {
      this.loadingSpinner.update();
   }

   private getErrorMessage(status: JoinResponseStatus): string {
      switch (status) {
         case JoinResponseStatus.SERVER_FULL:
            return 'Server is full.';
      }
      return 'Unexpected error occurred.';
   }
}
