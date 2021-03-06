import * as Phaser from 'phaser';
import { GunSprite } from './gun-sprite';
import { VectorUtil } from '../util/vector-util';
import { ClientConfig } from '../config/client-config';
import { Vector } from '../../shared/bullet/vector-model';
import { Keys, PlayerSpriteSheetConfig } from '../config/client-constants';
import { PlayerType } from '../../shared/player/player-model';
import { PLAYERS } from '../../shared/config/shared-constants';
import { MathUtil } from '../util/math-util';
import Vector2 = Phaser.Math.Vector2;

interface PlayerOptions {
   readonly scene: Phaser.Scene;
   readonly cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
   readonly wasdKeys: {
      keyW: Phaser.Input.Keyboard.Key;
      keyA: Phaser.Input.Keyboard.Key;
      keyS: Phaser.Input.Keyboard.Key;
      keyD: Phaser.Input.Keyboard.Key;
   };
   readonly callbacks: {
      readonly onStartMoving: () => void;
      readonly onStartStanding: () => void;
      readonly onPositionChanged: (position: Vector) => void;
      readonly onDirectionChanged: (position: Vector) => void;
      readonly onShoot: (position: Phaser.Math.Vector2) => void;
      readonly onAmmoChanged: (ammo: number) => void;
   };
   readonly physics: {
      readonly leftWallCollision: (player: PlayerSprite, width: number, height: number) => boolean;
      readonly rightWallCollision: (player: PlayerSprite, width: number, height: number) => boolean;
      readonly floorCollision: (player: PlayerSprite, width: number, height: number) => boolean;
      readonly ceilingCollision: (player: PlayerSprite, width: number, height: number) => boolean;
   };
}

const MOON_LAND_SOUND_KEYS = [
   Keys.MOON_LAND_SOUND_0,
   Keys.MOON_LAND_SOUND_1,
   Keys.MOON_LAND_SOUND_2,
   Keys.MOON_LAND_SOUND_3,
   Keys.MOON_LAND_SOUND_4,
   Keys.MOON_LAND_SOUND_5,
   Keys.MOON_LAND_SOUND_6,
   Keys.MOON_LAND_SOUND_7,
   Keys.MOON_LAND_SOUND_8,
];

// Collision based on: http://jsfiddle.net/ksmbx3fz/7/

const MAX_HORIZONTAL_SPEED = 1;
const MAX_VERTICAL_SPEED = 8;
export const PLAYER_HEIGHT = ClientConfig.PLAYER_HEIGHT;
export const PLAYER_WIDTH = ClientConfig.PLAYER_WIDTH;

export class PlayerSprite extends Phaser.GameObjects.Container {
   private prevPosition = new Vector2();
   private readonly gun: GunSprite;
   private readonly character: Phaser.GameObjects.Sprite;
   private isInTheAir = false;
   private verticalSpeed = 0;
   // private readonly debugger: HitBoxDebugger;
   private dustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
   private landingDustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
   private readonly spriteSheetConfig: PlayerSpriteSheetConfig;
   private lastJumpTimestamp = 0;
   private ammo = ClientConfig.MAX_AMMO;

   constructor(private readonly options: PlayerOptions, private readonly playerType: PlayerType) {
      super(options.scene, 0, 0);
      this.setScale(1 / ClientConfig.MAP_OUTPUT_SCALE, 1 / ClientConfig.MAP_OUTPUT_SCALE);

      const particle = options.scene.add.particles(Keys.SMOKE_FIRE);
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

      this.landingDustEmitter = particle.createEmitter({
         speed: { min: -20, max: 20 },
         angle: { min: 0, max: 360 },
         scale: { start: 0, end: 2 / ClientConfig.MAP_OUTPUT_SCALE },
         alpha: { start: 1, end: 0, ease: 'Expo.easeIn' },
         gravityY: 0,
         lifespan: 300,
      });
      this.landingDustEmitter.reserve(20);
      this.landingDustEmitter.stop();

      this.spriteSheetConfig = PLAYERS[playerType];
      this.character = options.scene.make.sprite({ key: this.spriteSheetConfig.spriteSheet });
      this.add(this.character);

      this.gun = new GunSprite({
         scene: options.scene,
         character: this.character,
         x: 30,
         y: -30,
      });
      options.scene.add.existing(this);
      this.add(
         (this.gun = new GunSprite({
            scene: options.scene,
            character: this.character,
            x: 30,
            y: -30,
         })),
      );
      this.character.setOrigin(0.5, 1);
      // this.debugger = new HitBoxDebugger({ scene: this.scene });
      // this.scene.add.existing(this.debugger);
   }

   private lastShootTimestamp = 0;
   private lastDirection: Vector = { x: null, y: null };

   private lastTime = 0;

   update(): void {
      const time = Date.now();
      const delta = Math.max(0, Math.min(100, (time - this.lastTime) / (1000 / 60)));
      this.lastTime = time;

      this.setRotation(VectorUtil.getFloorVector(this).scale(-1).angle());
      const direction = VectorUtil.getRelativeMouseDirection(this.options.scene, this).rotate(-this.rotation);
      if (direction.x !== this.lastDirection.x || direction.y !== this.lastDirection.y) {
         this.lastDirection.x = direction.x;
         this.lastDirection.y = direction.y;
         this.options.callbacks.onDirectionChanged(direction);
      }

      if (direction.x < 0) {
         this.character.flipX = true;
         this.gun.flip(true);
         this.gun.setPosition(-30, -30);
      } else {
         this.character.flipX = false;
         this.gun.flip(false);
         this.gun.setPosition(30, -30);
      }

      const position = this.getCenterPoint();
      if (this.prevPosition.x !== position.x || this.prevPosition.y !== position.y) {
         this.prevPosition.set(position.x, position.y);
         this.options.callbacks.onPositionChanged(this.prevPosition);
      }

      if (this.options.cursorKeys.left.isDown || this.options.wasdKeys.keyA.isDown) {
         this.moving();
         for (let _ = 0; _ < MAX_HORIZONTAL_SPEED; _++) {
            if (!this.options.physics.leftWallCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.moveLeft(this);
            }
            while (this.options.physics.floorCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.applyGroundReactionForce(this);
            }
         }
      } else if (this.options.cursorKeys.right.isDown || this.options.wasdKeys.keyD.isDown) {
         this.moving();
         for (let _ = 0; _ < MAX_HORIZONTAL_SPEED; _++) {
            if (!this.options.physics.rightWallCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.moveRight(this);
            }
            while (this.options.physics.floorCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.applyGroundReactionForce(this);
            }
         }
      } else {
         this.standing();
      }

      if (
         (this.options.cursorKeys.up.isDown ||
            this.options.wasdKeys.keyW.isDown ||
            this.options.cursorKeys.space.isDown) &&
         this.canJump()
      ) {
         this.verticalSpeed = -MAX_VERTICAL_SPEED;
         this.isInTheAir = true;
         this.lastJumpTimestamp = Date.now();
      }

      this.verticalSpeed += 0.5;
      this.verticalSpeed = Phaser.Math.Clamp(this.verticalSpeed, -MAX_VERTICAL_SPEED, MAX_VERTICAL_SPEED * 0.3);

      for (let _ = 0; _ < Math.abs(this.verticalSpeed); _++) {
         if (this.verticalSpeed > 0) {
            //check ground
            if (!this.options.physics.floorCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.applyGravity(this);
            } else {
               this.isInTheAir = false;
               this.justLanded();
               this.verticalSpeed = 0;
            }
         } else {
            if (!this.options.physics.ceilingCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.applyGroundReactionForce(this);
            } else {
               this.verticalSpeed = 0;
            }
         }
      }

      if (this.scene.input.activePointer.isDown) {
         if (Date.now() > this.lastShootTimestamp + ClientConfig.TIME_BETWEEN_TWO_SHOOTS_MS) {
            if (this.ammo >= 1) {
               this.lastShootTimestamp = Date.now();
               this.ammo--;
               const gunPosition = new Vector2({ x: this.x, y: this.y }).add(
                  new Vector2({
                     x: this.gun.x / ClientConfig.MAP_OUTPUT_SCALE,
                     y: this.gun.y / ClientConfig.MAP_OUTPUT_SCALE,
                  }).rotate(this.rotation),
               );
               this.options.callbacks.onShoot(gunPosition);
            }
         }
      }

      if (
         VectorUtil.getDownwardVectorFromCenter(this).length() <=
         ClientConfig.LAVA_RADIUS - ClientConfig.LAVA_SAFE_ZONE - 11
      ) {
         this.scene.sound
            .add(Keys.LAVA_SIZZLE, {
               volume: 0.1,
               detune: 100 * Math.random() * 2,
            })
            .play();
      }

      this.updateAmmo(delta);
      this.gun.update();
      // this.debugger.update(this);
   }

   getCenterPoint(): Phaser.Math.Vector2 {
      return new Phaser.Math.Vector2({ x: this.x, y: this.y }).add(
         VectorUtil.getUpwardVector(this).scale(ClientConfig.PLAYER_SPRITE_HEIGHT / 2 / ClientConfig.MAP_OUTPUT_SCALE),
      );
   }

   private isMoving = false;

   private moving(): void {
      if (!this.isMoving) {
         this.isMoving = true;
         this.options.callbacks.onStartMoving();
         this.character.anims.play(this.spriteSheetConfig.walkAnimation, true);
         this.dustEmitter.start();
      }
   }

   private standing(): void {
      if (this.isMoving) {
         this.isMoving = false;
         this.options.callbacks.onStartStanding();
         this.character.anims.pause();
         this.dustEmitter.stop();
      }
   }

   private justLanded(): void {
      // The player's speed is high enough for it to make impact effects
      if (this.verticalSpeed > 2) {
         this.scene.sound
            .add(MOON_LAND_SOUND_KEYS[MathUtil.randomIntFromInterval(0, MOON_LAND_SOUND_KEYS.length - 1)], {
               volume: 0.05,
               detune: 250 * Math.random() * 2 - 1,
            })
            .play();
         this.landingDustEmitter.explode(10, this.x, this.y);
      }
   }

   private canJump(): boolean {
      return !this.isInTheAir && Date.now() > this.lastJumpTimestamp + ClientConfig.TIME_BETWEEN_TWO_JUMP_MS;
   }

   private updateAmmo(delta: number): void {
      const newAmmo = Math.min(this.ammo + (ClientConfig.AMMO_RESTORE_PER_S / 60) * delta, ClientConfig.MAX_AMMO);
      if (newAmmo !== this.ammo) {
         this.options.callbacks.onAmmoChanged(newAmmo);
      }
      this.ammo = newAmmo;
   }
}
