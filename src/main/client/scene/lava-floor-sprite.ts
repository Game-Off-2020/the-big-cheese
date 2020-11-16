import * as Phaser from 'phaser';

interface LavaFloorOptions {
   readonly scene: Phaser.Scene;
   readonly size: number;
}

export class LavaFloorSprite extends Phaser.GameObjects.Sprite {
   private lavaTexture;
   private radius;
   constructor(options: LavaFloorOptions) {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      canvas.width = options.size;
      canvas.height = options.size;

      const texture = options.scene.textures.addCanvas('lava', canvas);
      super(options.scene, 0, 0, 'lava');

      this.radius = canvas.width / 2;
      this.lavaTexture = texture;
      this.lavaTexture.context.beginPath();
      this.lavaTexture.context.fillStyle = '#ebb134';
      this.lavaTexture.context.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, true);
      this.lavaTexture.context.fill();
      this.lavaTexture.refresh();

      options.scene.add.existing(this);
   }
}
