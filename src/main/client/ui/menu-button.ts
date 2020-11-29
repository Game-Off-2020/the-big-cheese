import Rectangle = Phaser.GameObjects.Rectangle;
import Text = Phaser.GameObjects.Text;

interface MenuButtonOptions {
   readonly scene: Phaser.Scene;
   readonly x: number;
   readonly y: number;
   readonly text: string;
   readonly onClick: () => void;
   readonly colors: {
      readonly label: {
         readonly over: string;
         readonly out: string;
         readonly down: string;
         readonly disabled: string;
      };
      readonly rectangle: {
         readonly over: number;
         readonly out: number;
         readonly down: number;
         readonly disabled: number;
      };
   };
}

export class MenuButton extends Phaser.GameObjects.Container {
   private readonly minimumWidth = 200;
   private readonly minimumHeight = 50;
   private readonly rectangle: Rectangle;
   private readonly disableRectangle: Rectangle;

   constructor(options: MenuButtonOptions) {
      super(options.scene, options.x, options.y);

      const textLabel = new Text(options.scene, 0, 0, options.text, {
         fontSize: '30px',
         align: 'center',
         fontFamily: 'CactusStory',
         stroke: '#000000',
         strokeThickness: 6,
      }).setOrigin(0.5, 0.5);

      const labelWidth = textLabel.width;
      const labelHeight = textLabel.height;

      this.rectangle = new Rectangle(
         options.scene,
         0,
         0,
         labelWidth >= this.minimumWidth ? labelWidth : this.minimumWidth,
         labelHeight >= this.minimumHeight ? labelHeight : this.minimumHeight,
      );

      this.disableRectangle = new Rectangle(
         options.scene,
         0,
         0,
         labelWidth >= this.minimumWidth ? labelWidth : this.minimumWidth,
         labelHeight >= this.minimumHeight ? labelHeight : this.minimumHeight,
         options.colors.rectangle.disabled,
      ).setVisible(false);

      this.add(this.rectangle);
      this.add(this.disableRectangle);
      this.add(textLabel);

      this.rectangle
         .setInteractive({ useHandCursor: true })
         .on('pointerover', () => {
            textLabel.setColor(options.colors.label.over);
            this.rectangle.setFillStyle(options.colors.rectangle.over);
         })
         .on('pointerout', () => {
            textLabel.setColor(options.colors.label.out);
            this.rectangle.setFillStyle(options.colors.rectangle.out);
         })
         .on('pointerdown', () => {
            textLabel.setColor(options.colors.label.down);
            this.rectangle.setFillStyle(options.colors.rectangle.down);
         })
         .on('pointerup', () => {
            textLabel.setColor(options.colors.label.out);
            this.rectangle.setFillStyle(options.colors.rectangle.out);
         });

      this.rectangle.on('pointerup', options.onClick);

      textLabel.setColor(options.colors.label.out);
      this.rectangle.setFillStyle(options.colors.rectangle.out);
      options.scene.add.existing(this);
   }

   update(disabled: boolean): void {
      if (disabled) {
         this.rectangle.setVisible(false);
         this.disableRectangle.setVisible(true);
      } else {
         this.rectangle.setVisible(true);
         this.disableRectangle.setVisible(false);
      }
   }
}
