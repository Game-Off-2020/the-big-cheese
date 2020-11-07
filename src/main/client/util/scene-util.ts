import { Scene } from 'phaser';

export class SceneUtil {
   static getWidth(scene: Scene): number {
      return scene.game.scale.width;
   }

   static getHeight(scene: Scene): number {
      return scene.game.scale.height;
   }
}
