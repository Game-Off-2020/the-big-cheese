import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/client-constants';

export class AmmoCounter extends Phaser.GameObjects.Container {
   private readonly text: Phaser.GameObjects.Text;

   constructor(protected readonly scene: Scene, protected readonly defaultValue: number) {
      super(scene, scene.game.scale.width - 100, 200);

      this.add(
         (this.text = new Phaser.GameObjects.Text(scene, -70, 0, defaultValue.toString(), {
            color: '#FFF',
            fontSize: '30px',
         })),
      );
      this.text.setOrigin(1, 0.5);

      const gunIcon = new Phaser.GameObjects.Image(scene, 0, -10, Keys.BASIC_GUN);
      gunIcon.setScale(1.5);
      gunIcon.setOrigin(1, 1);
      gunIcon.setRotation(-Math.PI / 4);
      this.add(gunIcon);

      this.setScrollFactor(0, 0);
      this.setDepth(300);

      scene.add.existing(this);
   }

   setAmmo(ammo: number): void {
      this.text.setText(ammo.toString());
   }
}
