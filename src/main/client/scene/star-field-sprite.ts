import * as Phaser from 'phaser';

interface StarFieldOptions {
   readonly scene: Phaser.Scene;
}

export class StarFieldSprite extends Phaser.GameObjects.Sprite {
   private starFieldTexture;

   constructor(options: StarFieldOptions) {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      canvas.width = options.scene.game.scale.width * 2;
      canvas.height = options.scene.game.scale.height * 2;

      const texture = options.scene.textures.addCanvas('star-field', canvas);
      super(options.scene, options.scene.game.scale.width / 2, options.scene.game.scale.height / 2, 'star-field');

      for (let i = 0; i < 2000; i++) {
         const radius = Math.random() * 2 + 0.2;
         const x = Math.floor(Math.random() * canvas.width) + 1;
         const y = Math.floor(Math.random() * canvas.height) + 1;

         this.starFieldTexture = texture;
         this.starFieldTexture.context.beginPath();
         this.starFieldTexture.context.fillStyle = '#ffffff';
         this.starFieldTexture.context.arc(x, y, radius, 0, Math.PI * 2, true);
         this.starFieldTexture.context.fill();
      }

      this.starFieldTexture.refresh();
      this.setScrollFactor(0, 0);

      options.scene.add.existing(this);
   }
}
