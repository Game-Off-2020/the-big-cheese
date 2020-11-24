import * as Phaser from 'phaser';

interface TextLinkOptions {
   readonly scene: Phaser.Scene;
   readonly x: number;
   readonly y: number;
   readonly text: string;
   readonly link: string;
   readonly origin: { readonly x: number; readonly y: number };
   readonly style: Phaser.Types.GameObjects.Text.TextStyle;
}

export class TextLink extends Phaser.GameObjects.Text {
   constructor(options: TextLinkOptions) {
      super(options.scene, options.x, options.y, options.text, options.style);

      this.setInteractive({ useHandCursor: true });
      this.setOrigin(options.origin.x, options.origin.y);

      this.on('pointerup', () => {
         window.open(options.link, '_blank');
      });

      this.on('pointerover', () => {
         this.setFill('#4287f5');
      });
      this.on('pointerout', () => {
         this.setFill('#fff');
      });

      options.scene.add.existing(this);
   }
}
