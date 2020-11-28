import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/client-constants';

export class AmmoCounter extends Phaser.GameObjects.Container {
   private readonly text: Phaser.GameObjects.Text;
   private gunIcon: Phaser.GameObjects.Image;

   constructor(protected readonly scene: Scene, protected readonly defaultValue: number) {
      super(scene, scene.game.scale.width - 100, 200);
      this.add(
         (this.text = new Phaser.GameObjects.Text(scene, -70, 0, defaultValue.toString(), {
            color: '#FFF',
            fontSize: '30px',
         })),
      );
      this.text.setOrigin(1, 0.5);
      this.setScrollFactor(0, 0);
      this.setDepth(300);
      this.setGunType(Keys.BASIC_GUN);
      scene.add.existing(this);
   }

   setAmmo(ammo: number): void {
      this.text.setText(ammo.toString());
   }

   setGunType(type: string): void {
      if (this.gunIcon) {
         this.gunIcon.destroy();
      }
      this.add((this.gunIcon = new Phaser.GameObjects.Image(this.scene, 0, -10, type)));
      this.gunIcon.setScale(1.5);
      this.gunIcon.setOrigin(1, 1);
      this.gunIcon.setRotation(-Math.PI / 4);
   }
}
