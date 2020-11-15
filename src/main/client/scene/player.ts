import * as Phaser from 'phaser';
import { Subject } from 'rxjs';

import Vector2 = Phaser.Math.Vector2;

interface PlayerOptions {
   readonly scene: Phaser.Scene;
   readonly x: number;
   readonly y: number;
}

export class Player extends Phaser.GameObjects.Sprite {
   private playerPosition = new Vector2();
   private playerPositionChangedSubject = new Subject<Vector2>();

   constructor(options: PlayerOptions) {
      super(options.scene, options.x, options.y, 'character');
      options.scene.add.existing(this);

      this.setOrigin(0.5, 1);
   }

   update(): void {
      if (this.playerPosition.x !== this.x || this.playerPosition.y !== this.y) {
         this.playerPosition.set(this.x, this.y);
         this.playerPositionChangedSubject.next(this.playerPosition);
      }
   }
}
