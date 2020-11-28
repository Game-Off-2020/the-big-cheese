import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { Keys } from '../config/client-constants';

const FULL_COLOR = Phaser.Display.Color.HexStringToColor('#32a852');
const EMPTY_COLOR = Phaser.Display.Color.HexStringToColor('#a83232');
const BAR_LENGTH = 200;
const GUN_ICON_OFFSET = 75;

export class AmmoCounter extends Phaser.GameObjects.Container {
   private gunIcon: Phaser.GameObjects.Image;
   private readonly rectangle: Phaser.GameObjects.Rectangle;

   constructor(protected readonly scene: Scene, private readonly fullValue: number) {
      super(scene, scene.game.scale.width - 100, 200);

      this.rectangle = new Phaser.GameObjects.Rectangle(
         scene,
         -BAR_LENGTH - GUN_ICON_OFFSET,
         0,
         BAR_LENGTH,
         30,
         FULL_COLOR.color,
      );
      this.rectangle.setOrigin(0, 0.5);
      this.add(this.rectangle);

      this.setScrollFactor(0, 0);
      this.setDepth(300);
      this.setGunType(Keys.BASIC_GUN);
      scene.add.existing(this);
   }

   setAmmo(ammo: number): void {
      this.rectangle.width = (ammo / this.fullValue) * BAR_LENGTH;
      // 100 for 100%
      const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
         EMPTY_COLOR,
         FULL_COLOR,
         100,
         (ammo / this.fullValue) * 100,
      );
      const newColor = new Phaser.Display.Color(colorObject.r, colorObject.g, colorObject.b);
      console.log(colorObject, (ammo / this.fullValue) * 100);
      this.rectangle.fillColor = newColor.color;
      this.rectangle.setX(-this.rectangle.width - GUN_ICON_OFFSET);
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
