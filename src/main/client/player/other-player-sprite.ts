import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { GunSprite } from './gun-sprite';
import { Player } from '../../shared/player/player-model';
import { Vector } from '../../shared/bullet/vector-model';
import { CatmullRomInterpolation } from '../util/catmull-rom-interpolation';
import { SharedConfig } from '../../shared/config/shared-config';
import { ClientConfig } from '../config/client-config';

export class OtherPlayerSprite extends Phaser.GameObjects.Container {
   private readonly gun: GunSprite;
   private readonly character: Phaser.GameObjects.Sprite;
   private readonly key: string;
   private readonly positionInterpolation = new CatmullRomInterpolation(
      SharedConfig.NETWORK_TICK_RATE,
      ClientConfig.INTERPOLATION_SIZE,
   );
   private readonly directionInterpolation = new CatmullRomInterpolation(
      SharedConfig.NETWORK_TICK_RATE,
      ClientConfig.INTERPOLATION_SIZE,
   );

   constructor(protected readonly scene: Scene, private readonly player: Player) {
      super(scene, 0, 0);
      this.key = 'player-' + player.id;
      const config = {
         key: `${this.key}-walk`,
         frames: scene.anims.generateFrameNumbers('player1', { frames: [0, 1, 2, 6, 7, 8] }),
         frameRate: 10,
         repeat: -1,
      };
      scene.anims.create(config);

      this.character = scene.make.sprite({ key: 'player1' });
      this.character.play(`${this.key}-walk`);
      this.add(this.character);

      this.gun = new GunSprite({
         scene,
         character: this.character,
         x: 30,
         y: -30,
      });
      this.add(this.gun);

      scene.add.existing(this);

      this.character.setOrigin(0.5, 1);
      this.tickPosition(player.position);
      this.tickDirection(player.direction);
   }

   tickPosition(position: Vector): void {
      this.positionInterpolation.add(position);
   }

   tickDirection(direction: Vector): void {
      this.directionInterpolation.add(direction);
   }

   update(): void {
      this.updatePosition();
      this.updateDirection();
      this.gun.update();
   }

   private updatePosition(): void {
      this.positionInterpolation.step();
      const position = this.positionInterpolation.get();
      this.character.setPosition(position.x, position.y);
   }

   private updateDirection(): void {
      this.directionInterpolation.step();
      const direction = this.directionInterpolation.get();
      // TODO
   }
}
