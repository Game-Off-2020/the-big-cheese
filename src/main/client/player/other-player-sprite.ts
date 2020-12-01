import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { GunSprite } from './gun-sprite';
import { Player } from '../../shared/player/player-model';
import { Vector } from '../../shared/bullet/vector-model';
import { CatmullRomInterpolation } from '../util/catmull-rom-interpolation';
import { ClientConfig } from '../config/client-config';
import { Keys, PlayerSpriteSheetConfig } from '../config/client-constants';
import { PLAYERS } from '../../shared/config/shared-constants';
import { VectorUtil } from '../util/vector-util';

export interface OtherPlayerOptions {
   readonly scene: Scene;
   readonly player: Player;
}

export class OtherPlayerSprite extends Phaser.GameObjects.Container {
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
   private gun: GunSprite;

   constructor(private readonly options: OtherPlayerOptions) {
      super(options.scene);
      this.setScale(1 / ClientConfig.MAP_OUTPUT_SCALE);
      options.scene.add.existing(this);

      this.spriteSheetConfig = PLAYERS[options.player.type];
      this.character = options.scene.make.sprite({ key: this.spriteSheetConfig.spriteSheet });
      this.character.setOrigin(0.5, 1);
      this.add(this.character);

      this.initGun();
      this.initDustParticleEffect();
      this.addPlayerName();
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
      const centerPoint = this.positionInterpolation.get();
      const bottomPosition = new Phaser.Math.Vector2({
         x: centerPoint.x,
         y: centerPoint.y,
      }).add(
         VectorUtil.getUpwardVector(this).scale(-ClientConfig.PLAYER_SPRITE_HEIGHT / 2 / ClientConfig.MAP_OUTPUT_SCALE),
      );
      this.setPosition(bottomPosition.x, bottomPosition.y);
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

   private initGun(): void {
      this.add(
         (this.gun = new GunSprite({
            scene: this.options.scene,
            character: this.character,
            x: 30,
            y: -30,
         })),
      );
   }

   private initDustParticleEffect(): void {
      const particle = this.options.scene.add.particles(Keys.SMOKE_FIRE);
      this.dustEmitter = particle.createEmitter({
         speed: { min: -20, max: 20 },
         angle: { min: 0, max: 360 },
         scale: { start: 0, end: 0.7 / ClientConfig.MAP_OUTPUT_SCALE },
         alpha: { start: 1, end: 0, ease: 'Expo.easeIn' },
         gravityY: 0,
         lifespan: 200,
         follow: this,
      });
      this.dustEmitter.reserve(20);
      this.dustEmitter.stop();
   }

   private addPlayerName(): void {
      this.add(
         new Phaser.GameObjects.Text(this.options.scene, 0, -120, this.options.player.name, {
            color: '#FFF',
            fontSize: '28px',
            fontFamily: 'CactusStory',
            stroke: '#000000',
            strokeThickness: 6,
         }).setOrigin(0.5),
      );
   }
}
