import * as Phaser from 'phaser';

export class VectorUtil {
   static getRelativeMouseDirection(
      scene: Phaser.Scene,
      reference: Phaser.GameObjects.Components.Transform,
   ): Phaser.Math.Vector2 {
      return new Phaser.Math.Vector2({ x: scene.input.activePointer.x, y: scene.input.activePointer.y })
         .subtract(new Phaser.Math.Vector2({ x: scene.game.scale.width / 2, y: scene.game.scale.height / 2 }))
         .normalize()
         .rotate(reference.rotation);
   }
}
