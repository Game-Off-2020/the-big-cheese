import { MenuButton } from '../ui/menu-button';
import { JoinResponseStatus } from '../../shared/network/shared-network-model';
import { Keys } from '../config/client-constants';

export class ErrorScene extends Phaser.Scene {
   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.ERROR_SCENE,
      });
   }

   create(settings: { status: JoinResponseStatus }): void {
      this.add
         .text(100, 50, this.getErrorMessage(settings.status), {
            fill: '#FFFFFF',
         })
         .setFontSize(24);

      new MenuButton({
         scene: this,
         x: 100,
         y: 150,
         text: 'Cancel',
         onClick: () => {
            this.game.scene.start(Keys.MAIN_MENU_SCENE);
         },
         colors: {
            label: {
               over: '#000000',
               out: '#FFFFFF',
               down: '#BBBBBB',
               disabled: '',
            },
            rectangle: {
               over: 0x636363,
               out: 0x888888,
               down: 0x444444,
               disabled: 0,
            },
         },
      });
   }

   private getErrorMessage(status: JoinResponseStatus): string {
      switch (status) {
         case JoinResponseStatus.SERVER_FULL:
            return 'Server is full.';
      }
      return 'Unexpected error occurred.';
   }
}
