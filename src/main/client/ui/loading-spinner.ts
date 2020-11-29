import * as Phaser from 'phaser';
import { Keys } from '../config/client-constants';

interface LoadingSpinnerOptions {
   readonly scene: Phaser.Scene;
   readonly x: number;
   readonly y: number;
}

export class LoadingSpinner extends Phaser.GameObjects.Container {
   private readonly rocket: Phaser.GameObjects.Sprite;

   constructor(options: LoadingSpinnerOptions) {
      super(options.scene, options.x, options.y);
      options.scene.add.existing(this);
      this.setScale(0.5);

      const moon = new Phaser.GameObjects.Sprite(options.scene, 0, 0, Keys.MOON_LOADING);
      this.rocket = new Phaser.GameObjects.Sprite(options.scene, 0, 0, Keys.ROCKET_LOADING);
      moon.setScale(0.6);
      this.rocket.setScale(0.5);
      this.rocket.setOrigin(2.5, 0.5);
      this.add(moon);
      this.add(this.rocket);
   }

   update(): void {
      this.rocket.setRotation(this.rocket.rotation + 0.05);
   }
}
