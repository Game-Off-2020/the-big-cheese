import * as Phaser from 'phaser';
import { Subject } from 'rxjs';
import Vector2 = Phaser.Math.Vector2;
import { Scene } from 'phaser';
import { GunSprite } from './gun-sprite';

export class PlayerSprite extends Phaser.GameObjects.Container {
   private _position = new Vector2();
   private positionChangedSubject = new Subject<Vector2>();
   readonly positionChanged$ = this.positionChangedSubject.asObservable();
   private gun: GunSprite;

   constructor(protected readonly scene: Scene) {
      super(scene, 0, 0);
      const character = scene.make.sprite({ key: 'character' });
      this.add(character);

      this.gun = new GunSprite(scene, character);
      this.add(this.gun);

      scene.add.existing(this);

      // this.add(game.make.sprite(-50, -50, 'mummy'));

      character.setOrigin(0.5, 1);
   }

   update(): void {
      if (this._position.x !== this.x || this._position.y !== this.y) {
         this._position.set(this.x, this.y);
         this.positionChangedSubject.next(this._position);
      }

      this.gun.update();
   }
}
