// Based off of: https://labs.phaser.io/edit.html?src=src\input\keyboard\text%20entry.js
import Rectangle = Phaser.GameObjects.Rectangle;
import Text = Phaser.GameObjects.Text;
import { fromEvent } from 'rxjs';

interface InputBoxOptions {
   readonly scene: Phaser.Scene;
   readonly x: number;
   readonly y: number;
   readonly placeholder: string;
   readonly maxLength: number;
}

export class InputBox extends Phaser.GameObjects.Container {
   private readonly textEntry: Text;

   constructor(private readonly options: InputBoxOptions) {
      super(options.scene, options.x, options.y);

      const textLabel = new Text(options.scene, 0, 0, options.placeholder, {
         fontSize: '18px',
         align: 'center',
         color: '#bfbfbf',
      }).setOrigin(0.5, 0.5);

      const rectangle = new Rectangle(options.scene, 0, 0, 300, 50, 0xffffff);

      this.textEntry = new Text(options.scene, 0, 0, '', {
         fontSize: '18px',
         align: 'center',
         color: '#000000',
      }).setOrigin(0.5, 0.5);

      fromEvent(this.scene.input.keyboard, 'keydown').subscribe((event: KeyboardEvent) => {
         if (event.keyCode === 8 && this.textEntry.text.length > 0) {
            this.textEntry.text = this.textEntry.text.substr(0, this.textEntry.text.length - 1);
         } else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) {
            if (this.textEntry.text.length > options.maxLength) {
               return;
            }
            this.textEntry.text += event.key;
         }
         if (this.textEntry.text.length > 0) {
            textLabel.setVisible(false);
         } else {
            textLabel.setVisible(true);
         }
      });

      this.add(rectangle);
      this.add(textLabel);
      this.add(this.textEntry);

      options.scene.add.existing(this);
   }

   getValue(): string {
      return this.textEntry.text;
   }
}
