import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/constants';
import { Vector } from '../../shared/bullet/vector-model';

export class CheeseSprite extends Phaser.GameObjects.Sprite {
   constructor(protected readonly scene: Scene, private readonly position: Vector) {
      super(scene, position.x, position.y, Keys.CHEESE);
      scene.add.existing(this);
      this.setScale(0.2, 0.2);
   }
}
