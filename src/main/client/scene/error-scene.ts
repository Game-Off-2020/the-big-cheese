import { MenuButton } from '../ui/menu-button';
import { JoinResponseStatus } from '../../shared/network/shared-network-model';
import { Keys } from '../config/constants';

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

      new MenuButton(this, 100, 150, 'Cancel', () => {
         this.game.scene.start(Keys.MAIN_MENU_SCENE);
      });
      // new MenuButton(this, 300, 150, 'Retry', () => {
      //   this.game.scene.start(Keys.MAIN_MENU_SCENE);
      //});
   }

   private getErrorMessage(status: JoinResponseStatus): string {
      switch (status) {
         case JoinResponseStatus.SERVER_FULL:
            return 'Server is full.';
      }
      return 'Unexpected error occurred.';
   }
}
