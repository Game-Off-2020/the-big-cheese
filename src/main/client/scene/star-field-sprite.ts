import * as Phaser from 'phaser';
import { MathUtil } from '../util/math-util';
import { ClientConfig } from '../config/client-config';

interface StarFieldOptions {
   readonly scene: Phaser.Scene;
}

export class StarFieldSprite extends Phaser.GameObjects.Sprite {
   private starFieldTexture: Phaser.Textures.CanvasTexture;

   constructor(options: StarFieldOptions) {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      const largestSide = Math.max(options.scene.game.scale.width, options.scene.game.scale.height);
      canvas.width = largestSide * 2;
      canvas.height = largestSide * 2;

      const texture = options.scene.textures.addCanvas('star-field', canvas);
      super(options.scene, options.scene.game.scale.width / 2, options.scene.game.scale.height / 2, 'star-field');
      this.setScale(1 / ClientConfig.MAP_OUTPUT_SCALE, 1 / ClientConfig.MAP_OUTPUT_SCALE);

      for (let i = 0; i < 2000; i++) {
         const radius = MathUtil.randomFloatFromInterval(0.2, 2);
         const x = MathUtil.randomIntFromInterval(1, canvas.width);
         const y = MathUtil.randomIntFromInterval(1, canvas.height);

         this.starFieldTexture = texture;
         this.starFieldTexture.context.beginPath();
         this.starFieldTexture.context.fillStyle = '#ffffff';
         this.starFieldTexture.context.arc(x, y, radius, 0, Math.PI * 2, true);
         this.starFieldTexture.context.fill();
      }

      this.starFieldTexture.refresh();
      this.setScrollFactor(0, 0);
      this.setDepth(-100);

      options.scene.add.existing(this);
   }
}
