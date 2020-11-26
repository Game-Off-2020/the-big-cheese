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

   static getUpwardVector(sprite: Phaser.GameObjects.Components.Transform): Phaser.Math.Vector2 {
      return this.getDownwardVector(sprite).scale(-1);
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

   static moveByVector(sprite: Phaser.GameObjects.Components.Transform, vector: Phaser.Math.Vector2): void {
      sprite.x += vector.x;
      sprite.y += vector.y;
   }

   static applyGravity(sprite: Phaser.GameObjects.Components.Transform): void {
      const vector = VectorUtil.getDownwardVector(sprite);
      this.moveByVector(sprite, vector);
   }

   static applyJump(sprite: Phaser.GameObjects.Components.Transform, scale: number): void {
      const vector = VectorUtil.getDownwardVector(sprite).scale(scale);
      this.moveByVector(sprite, vector);
   }

   static applyGroundReactionForce(sprite: Phaser.GameObjects.Components.Transform): void {
      const vector = VectorUtil.getDownwardVector(sprite).scale(-1);
      this.moveByVector(sprite, vector);
   }

   static moveLeft(sprite: Phaser.GameObjects.Components.Transform): void {
      const floorVector = VectorUtil.getFloorVector(sprite);
      this.moveByVector(sprite, floorVector);
   }

   static moveRight(sprite: Phaser.GameObjects.Components.Transform): void {
      const floorVector = VectorUtil.getFloorVector(sprite).scale(-1);
      this.moveByVector(sprite, floorVector);
   }

   static createLocalWall(sprite: Phaser.GameObjects.Components.Transform, length: number): Phaser.Geom.Point[] {
      const downVector = VectorUtil.getDownwardVector(sprite);

      return this.createCollisionLine(downVector, length, 0);
   }

   static createLocalFloor(sprite: Phaser.GameObjects.Components.Transform, length: number): Phaser.Geom.Point[] {
      const floorVector = VectorUtil.getFloorVector(sprite);

      return this.createCollisionLine(floorVector, length, 0);
   }

   static createCollisionLine(vector: Phaser.Math.Vector2, length: number, offset: number): Phaser.Geom.Point[] {
      return [...Array(length).keys()]
         .map((key) => key + offset)
         .map((i) => {
            const newDownVector = vector.clone().scale(i);
            return new Phaser.Geom.Point(newDownVector.x, newDownVector.y);
         });
   }
}
