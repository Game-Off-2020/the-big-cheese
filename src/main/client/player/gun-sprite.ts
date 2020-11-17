import * as Phaser from 'phaser';

import { Scene } from 'phaser';
import { VectorUtil } from '../util/vector-util';

export class GunSprite extends Phaser.GameObjects.Sprite {
   constructor(protected readonly scene: Scene, private readonly character: Phaser.GameObjects.Sprite) {
      super(scene, 0, 0, 'basic-gun');
      scene.add.existing(this);
   }

   update(): void {
      const direction = VectorUtil.getRelativeMouseDirection(this.scene, this.character);

      this.setRotation(direction.angle());
   }
}
