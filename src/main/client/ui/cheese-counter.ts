import * as Phaser from 'phaser';
import { Keys } from '../config/client-constants';

interface CheeseCounterOptions {
   readonly scene: Phaser.Scene;
   readonly count: number;
}

export class CheeseCounter extends Phaser.GameObjects.Container {
   constructor(private readonly options: CheeseCounterOptions) {
      super(options.scene, options.scene.game.scale.width - 100, 100);

      const text = new Phaser.GameObjects.Text(options.scene, -70, 0, options.count.toString(), {
         color: '#FFF',
         fontSize: '30px',
      });
      text.setOrigin(1, 0.5);
      this.add(text);

      const cheese = new Phaser.GameObjects.Image(options.scene, 0, 0, Keys.CHEESE_UNIT);
      cheese.setScale(0.2);
      cheese.setOrigin(1, 0.5);
      this.add(cheese);

      this.setScrollFactor(0, 0);
      this.setDepth(300);

      options.scene.add.existing(this);
   }

   update(): void {}
}
