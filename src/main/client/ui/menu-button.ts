import Rectangle = Phaser.GameObjects.Rectangle;
import Text = Phaser.GameObjects.Text;

export class MenuButton extends Rectangle {
   private readonly label: Text;
   private readonly padding = 10;
   private readonly minimumWidth = 200;
   private readonly minimumHeight = 50;

   constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick?: () => void) {
      super(scene, x, y);
      scene.add.existing(this);
      this.setOrigin(0, 0);

      this.label = scene.add
         .text(x + this.padding, y + this.padding, text)
         .setFontSize(18)
         .setAlign('center');

      const labelWidth = this.label.width + this.padding;
      const labelHeight = this.label.height + this.padding;

      this.width = labelWidth >= this.minimumWidth ? labelWidth : this.minimumWidth;
      this.height = labelHeight >= this.minimumHeight ? labelHeight : this.minimumHeight;

      this.setInteractive({ useHandCursor: true })
         .on('pointerover', this.enterMenuButtonHoverState)
         .on('pointerout', this.enterMenuButtonRestState)
         .on('pointerdown', this.enterMenuButtonActiveState)
         .on('pointerup', this.enterMenuButtonHoverState);

      if (onClick) {
         this.on('pointerup', onClick);
      }

      this.enterMenuButtonRestState();
   }

   private enterMenuButtonHoverState() {
      this.label.setColor('#000000');
      this.setFillStyle(0x888888);
   }

   private enterMenuButtonRestState() {
      this.label.setColor('#FFFFFF');
      this.setFillStyle(0x888888);
   }

   private enterMenuButtonActiveState() {
      this.label.setColor('#BBBBBB');
      this.setFillStyle(0x444444);
   }
}
