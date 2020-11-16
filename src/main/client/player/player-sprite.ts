import * as Phaser from 'phaser';
import { Subject } from 'rxjs';
import Vector2 = Phaser.Math.Vector2;
import { Scene } from 'phaser';

export class PlayerSprite extends Phaser.GameObjects.Sprite {
   private position = new Vector2();
   private positionChangedSubject = new Subject<Vector2>();
   readonly positionChanged$ = this.positionChangedSubject.pipe();

   constructor(protected readonly scene: Scene) {
      super(scene, 0, 0, 'character');
      scene.add.existing(this);

      this.setOrigin(0.5, 1);
   }

   update(): void {
      if (this.position.x !== this.x || this.position.y !== this.y) {
         this.position.set(this.x, this.y);
         this.positionChangedSubject.next(this.position);
      }
   }
}
