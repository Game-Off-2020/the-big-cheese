import * as Phaser from 'phaser';
import { Keys } from '../config/client-constants';

interface CheeseCounterOptions {
   readonly scene: Phaser.Scene;
   readonly count: number;
}

export class CheeseCounter extends Phaser.GameObjects.Container {
   private readonly text: Phaser.GameObjects.Text;

   constructor(private readonly options: CheeseCounterOptions) {
      super(options.scene, options.scene.game.scale.width - 100, 100);

      this.add(
         (this.text = new Phaser.GameObjects.Text(options.scene, -70, 0, options.count.toString(), {
            color: '#FFF',
            fontSize: '30px',
         })),
      );
      this.text.setOrigin(1, 0.5);

      const cheese = new Phaser.GameObjects.Image(options.scene, 0, 0, Keys.CHEESE_UNIT);
      cheese.setScale(0.2);
      cheese.setOrigin(1, 0.5);
      this.add(cheese);

      this.setScrollFactor(0, 0);
      this.setDepth(300);

      options.scene.add.existing(this);
   }

   setCount(count: number): void {
      this.text.setText(count.toString());
   }
}
