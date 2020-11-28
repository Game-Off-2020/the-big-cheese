import * as Phaser from 'phaser';
import { Keys } from '../config/client-constants';

interface MoonPercentageIndicatorOptions {
   readonly scene: Phaser.Scene;
   readonly percentage: number;
}

const Y_POSITION = 100;
const X_POSITION = 100;
const MOON_SCALE_FACTOR = 0.2;

export class MoonPercentageIndicator extends Phaser.GameObjects.Container {
   private readonly text: Phaser.GameObjects.Text;

   constructor(private readonly options: MoonPercentageIndicatorOptions) {
      super(options.scene, options.scene.game.scale.width - X_POSITION, Y_POSITION);

      this.add(
         (this.text = new Phaser.GameObjects.Text(options.scene, -70, 0, Math.round(options.percentage * 100) + '%', {
            color: '#FFF',
            fontSize: '40px',
            fontFamily: 'CactusStory',
            stroke: '#000000',
            strokeThickness: 6,
         })),
      );
      this.text.setOrigin(1, 0.5);

      const emptyMoon = new Phaser.GameObjects.Image(options.scene, 0, 0, Keys.MOON_EMPTY_HUD);
      emptyMoon.setScale(MOON_SCALE_FACTOR);
      emptyMoon.setOrigin(1, 0.5);
      this.add(emptyMoon);

      const fullMoon = new Phaser.GameObjects.Image(options.scene, 0, 0, Keys.MOON_FULL_HUD);
      fullMoon.setScale(MOON_SCALE_FACTOR);
      fullMoon.setOrigin(1, 0.5);
      this.add(fullMoon);

      const shape = new Phaser.GameObjects.Graphics(options.scene);
      shape.fillStyle(0xffffff);
      shape.beginPath();

      const fullPosition = Y_POSITION - (fullMoon.height * MOON_SCALE_FACTOR) / 2;
      const emptyPosition = Y_POSITION + (fullMoon.height * MOON_SCALE_FACTOR) / 2;

      const position = Phaser.Math.Interpolation.SmoothStep(options.percentage, emptyPosition, fullPosition);
      shape.fillRect(0, position, options.scene.game.scale.width, options.scene.game.scale.height);

      const mask = shape.createGeometryMask();

      fullMoon.setMask(mask);

      this.setScrollFactor(0, 0);
      this.setDepth(300);

      options.scene.add.existing(this);

      options.scene.scale.on(
         'resize',
         (gameSize: Phaser.Structs.Size) => {
            this.setPosition(gameSize.width - X_POSITION, Y_POSITION);
            shape.fillRect(0, position, gameSize.width, gameSize.height);
         },
         this,
      );
   }
}
