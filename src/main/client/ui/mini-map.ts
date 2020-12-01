import * as Phaser from 'phaser';
import * as shortid from 'shortid';

interface MiniMapOptions {
   readonly scene: Phaser.Scene;
   readonly canvas: HTMLCanvasElement;
}

export class MiniMap extends Phaser.GameObjects.Container {
   private terrainTexture: Phaser.Textures.CanvasTexture;
   private readonly moonTexture: HTMLImageElement;

   constructor(options: MiniMapOptions) {
      const id = shortid.generate();
      const terrainTexture = options.scene.textures.addCanvas(id, options.canvas);
      super(options.scene, 200, options.scene.game.scale.height - 200);
      const terrain = new Phaser.GameObjects.Sprite(options.scene, 0, 0, id);
      this.add(terrain);

      this.terrainTexture = terrainTexture;
      this.setScale(0.2);
      options.scene.add.existing(this);
      this.drawMoonTextureOverMask();
      this.terrainTexture.update();

      this.setScrollFactor(0, 0);
      this.setDepth(300);

      options.scene.scale.on(
         'resize',
         (gameSize: Phaser.Structs.Size) => {
            this.setPosition(200, gameSize.height - 200);
         },
         this,
      );
   }

   update(): void {
      this.terrainTexture.update();
      super.update();
   }

   drawMoonTextureOverMask(): void {
      this.terrainTexture.context.globalCompositeOperation = 'source-in';
      // this.terrainTexture.draw(0, 0, this.moonTexture);
      // this.terrainTexture.context.beginPath();
      // this.terrainTexture.context.rect(0, 0, 1000, 1000);
      // this.terrainTexture.context.fillStyle = 'red';
      // this.terrainTexture.context.fill();
   }
}
