import { ServerConfig } from '../../server/config/server-config';

import Rectangle = Phaser.GameObjects.Rectangle;
import Text = Phaser.GameObjects.Text;

interface ServerButtonOptions {
   readonly scene: Phaser.Scene;
   readonly x: number;
   readonly y: number;
   readonly text: string;
   readonly subText: string;
   readonly serverConfig: ServerConfig;
   readonly onClick: () => void;
   readonly colors: {
      readonly label: {
         readonly over: string;
         readonly out: string;
         readonly down: string;
      };
      readonly rectangle: {
         readonly over: number;
         readonly out: number;
         readonly down: number;
      };
   };
}

const BUTTON_SIZE = 180;

export class ServerButton extends Phaser.GameObjects.Container {
   private readonly graphics: Phaser.GameObjects.Graphics;

   constructor(private readonly options: ServerButtonOptions) {
      super(options.scene, options.x, options.y);

      const textLabel = new Text(options.scene, 0, 0, options.text, {
         fontSize: '18px',
         align: 'center',
      }).setOrigin(0.5, 0.5);

      const subTextLabel = new Text(options.scene, 0, 30, options.subText, {
         fontSize: '14px',
         align: 'center',
      }).setOrigin(0.5, 0.5);

      const rectangle = new Rectangle(options.scene, 0, 0, BUTTON_SIZE, BUTTON_SIZE);

      this.graphics = options.scene.make.graphics({});

      this.add(rectangle);
      this.add(textLabel);
      this.add(subTextLabel);
      this.add(this.graphics);

      rectangle
         .setInteractive({ useHandCursor: true })
         .on('pointerover', () => {
            textLabel.setColor(options.colors.label.over);
            rectangle.setFillStyle(options.colors.rectangle.over);
         })
         .on('pointerout', () => {
            textLabel.setColor(options.colors.label.out);
            rectangle.setFillStyle(options.colors.rectangle.out);
         })
         .on('pointerdown', () => {
            textLabel.setColor(options.colors.label.down);
            rectangle.setFillStyle(options.colors.rectangle.down);
         })
         .on('pointerup', () => {
            textLabel.setColor(options.colors.label.out);
            rectangle.setFillStyle(options.colors.rectangle.out);
         });

      rectangle.on('pointerup', options.onClick);

      textLabel.setColor(options.colors.label.out);
      rectangle.setFillStyle(options.colors.rectangle.out);
      options.scene.add.existing(this);
   }

   update(serverConfig: ServerConfig): void {
      this.graphics.clear();

      if (this.options.serverConfig === serverConfig) {
         this.graphics.lineStyle(4, 0xffff00, 1);
         this.graphics.strokeRect(-BUTTON_SIZE / 2, -BUTTON_SIZE / 2, BUTTON_SIZE, BUTTON_SIZE);
      }
   }

   getServerConfig(): ServerConfig {
      return this.options.serverConfig;
   }
}
