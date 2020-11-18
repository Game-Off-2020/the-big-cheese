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

   static getFloorVector(sprite: Phaser.GameObjects.Components.Transform): Phaser.Math.Vector2 {
      return this.getDownwardVector(sprite).normalizeRightHand();
   }

   static getDownwardVector(sprite: Phaser.GameObjects.Components.Transform): Phaser.Math.Vector2 {
      return this.getDownwardVectorFromCenter(sprite).normalize();
   }

   static getDownwardVectorFromCenter(sprite: Phaser.GameObjects.Components.Transform): Phaser.Math.Vector2 {
      return new Phaser.Math.Vector2({ x: -sprite.x, y: -sprite.y });
   }

   static getVectorRelativeTo(
      sprite: Phaser.GameObjects.Components.Transform,
      relativePoint: Phaser.Math.Vector2,
   ): Phaser.Math.Vector2 {
      console.log(relativePoint, { x: sprite.x, y: sprite.y });
      return relativePoint.scale(-1).add(new Phaser.Math.Vector2({ x: sprite.x, y: sprite.y }));
   }
}
