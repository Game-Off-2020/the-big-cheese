import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { GunSprite } from './gun-sprite';
import { PlayerType } from '../../shared/player/player-model';
import { Vector } from '../../shared/bullet/vector-model';
import { CatmullRomInterpolation } from '../util/catmull-rom-interpolation';
import { ClientConfig } from '../config/client-config';
import { Keys, PlayerSpriteSheetConfig } from '../config/client-constants';
import { PLAYERS } from '../../shared/config/shared-constants';

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
   private readonly spriteSheetConfig: PlayerSpriteSheetConfig;
   private dustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

   constructor(protected readonly scene: Scene, private readonly playerType: PlayerType) {
      super(scene);
      this.setScale(1 / ClientConfig.MAP_OUTPUT_SCALE, 1 / ClientConfig.MAP_OUTPUT_SCALE);
      scene.add.existing(this);

      this.spriteSheetConfig = PLAYERS[playerType];
      this.character = scene.make.sprite({ key: this.spriteSheetConfig.spriteSheet });
      this.character.setOrigin(0.5, 1);
      this.add(this.character);

      this.add(
         (this.gun = new GunSprite({
            scene,
            character: this.character,
            x: 30,
            y: -30,
         })),
      );

      const particle = scene.add.particles(Keys.SMOKE_FIRE);
      this.dustEmitter = particle.createEmitter({
         speed: { min: -20, max: 20 },
         angle: { min: 0, max: 360 },
         scale: { start: 0, end: 0.7 / ClientConfig.MAP_OUTPUT_SCALE },
         alpha: { start: 1, end: 0, ease: 'Expo.easeIn' },
         gravityY: 0,
         lifespan: 200,
         follow: this,
      });
      this.dustEmitter.reserve(1000);
      this.dustEmitter.stop();
   }

   tickPosition(position: Vector): void {
      this.positionInterpolation.add(position);
   }

   tickDirection(direction: Vector): void {
      this.directionInterpolation.add(direction);
   }

   setMoving(moving: boolean): void {
      if (moving) {
         this.character.anims.play(this.spriteSheetConfig.walkAnimation, true);
         this.dustEmitter.start();
      } else {
         this.character.anims.pause();
         this.dustEmitter.stop();
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
