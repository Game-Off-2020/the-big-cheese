import * as Phaser from 'phaser';
import { Keys } from '../config/constants';
import { MathUtil } from '../util/math-util';
import * as shortid from 'shortid';

interface StarFieldOptions {
   readonly scene: Phaser.Scene;
   readonly scale: number;
}

export class StarFieldSprite extends Phaser.GameObjects.Sprite {
   private starFieldTexture: Phaser.Textures.CanvasTexture;

   constructor(options: StarFieldOptions) {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      const largestSide = Math.max(options.scene.game.scale.width, options.scene.game.scale.height);
      canvas.width = largestSide * 2;
      canvas.height = largestSide * 2;

      const id = shortid.generate();

      const texture = options.scene.textures.addCanvas(id, canvas);
      super(options.scene, options.scene.game.scale.width / 2, options.scene.game.scale.height / 2, id);
      this.setScale(1 / options.scale, 1 / options.scale);

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
