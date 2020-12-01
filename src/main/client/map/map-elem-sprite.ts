import CanvasTexture = Phaser.Textures.CanvasTexture;

export interface MapElemSpriteOptions {
   readonly scene: Phaser.Scene;
   readonly x: number;
   readonly y: number;
   readonly width: number;
   readonly height: number;
   readonly radius: number;
   readonly texture: string;
   readonly sourceCanvas: HTMLCanvasElement;
}

export class MapElemSprite extends Phaser.GameObjects.Sprite {
   needsUpdate = true;

   constructor(private readonly options: MapElemSpriteOptions) {
      super(options.scene, options.x, options.y, options.texture);
      this.update();
   }

   update(): void {
      if (this.needsUpdate) {
         this.updateTexture();
         this.needsUpdate = false;
      }
      super.update();
   }

   drawOver(texture: HTMLImageElement): void {
      (this.texture as CanvasTexture).context.globalCompositeOperation = 'source-in';
      (this.texture as CanvasTexture).draw(-this.x, -this.y, texture);
      (this.texture as CanvasTexture).update();
   }

   getAlpha(x: number, y: number): number {
      // TODO: Could cache image data on update
      const canvasData = (this.texture as CanvasTexture).getData(Math.floor(x) - this.x, Math.floor(y) - this.y, 1, 1);
      return canvasData.data[3];
   }

   private updateTexture(): void {
      (this.texture as CanvasTexture).draw(-this.x, -this.y, this.options.sourceCanvas);
      (this.texture as CanvasTexture).update();
   }
}
