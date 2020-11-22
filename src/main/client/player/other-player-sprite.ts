import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { GunSprite } from './gun-sprite';
import { Player } from '../../shared/player/player-model';
import { Vector } from '../../shared/bullet/vector-model';
import { CatmullRomInterpolation } from '../util/catmull-rom-interpolation';
import { ClientConfig } from '../config/client-config';

export class OtherPlayerSprite extends Phaser.GameObjects.Container {
   private readonly gun: GunSprite;
   private readonly character: Phaser.GameObjects.Sprite;
   private readonly positionInterpolation = new CatmullRomInterpolation(
      ClientConfig.NETWORK_TICK_RATE,
      ClientConfig.INTERPOLATION_SIZE,
   );
   private readonly directionInterpolation = new CatmullRomInterpolation(
      ClientConfig.NETWORK_TICK_RATE,
      ClientConfig.INTERPOLATION_SIZE,
   );

   constructor(protected readonly scene: Scene, private readonly player: Player) {
      super(scene);
      this.setScale(1 / ClientConfig.MAP_OUTPUT_SCALE, 1 / ClientConfig.MAP_OUTPUT_SCALE);
      scene.anims.create({
         key: 'player-walk',
         frames: scene.anims.generateFrameNumbers('player', { frames: [0, 1, 2, 6, 7, 8] }),
         frameRate: 10,
         repeat: -1,
      });
      scene.add.existing(this);
      this.add((this.character = scene.make.sprite({ key: 'player' })));
      this.character.setOrigin(0.5, 1);
      this.add(
         (this.gun = new GunSprite({
            scene,
            character: this.character,
            x: 30,
            y: -30,
         })),
      );

      this.tickPosition(player.position);
      this.tickDirection(player.direction);
   }

   tickPosition(position: Vector): void {
      this.positionInterpolation.add(position);
   }

   tickDirection(direction: Vector): void {
      this.directionInterpolation.add(direction);
   }

   setMoving(moving: boolean): void {
      if (moving) {
         this.character.anims.play('player-walk', true);
      } else {
         this.character.anims.pause();
      }
   }

   update(): void {
      this.updatePosition();
      this.updateDirection();
      this.gun.update();
   }

   private updatePosition(): void {
      this.positionInterpolation.step();
      const position = this.positionInterpolation.get();
      this.setPosition(position.x, position.y);
   }

   private updateDirection(): void {
      this.directionInterpolation.step();
      const direction = this.directionInterpolation.get();
      this.gun.setRelativeDirection(direction.x, direction.y);
      if (direction.x < 0) {
         this.character.flipX = true;
         this.gun.flip(true);
         this.gun.setPosition(-30, -30);
      } else {
         this.character.flipX = false;
         this.gun.flip(false);
         this.gun.setPosition(30, -30);
      }
   }
}
