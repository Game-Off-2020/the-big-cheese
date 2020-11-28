import * as Phaser from 'phaser';
import { GunSprite } from './gun-sprite';
import { VectorUtil } from '../util/vector-util';
import { ClientConfig } from '../config/client-config';
import { Vector } from '../../shared/bullet/vector-model';
import { Keys, PlayerSpriteSheetConfig } from '../config/client-constants';
import { PlayerType } from '../../shared/player/player-model';
import { PLAYERS } from '../../shared/config/shared-constants';
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

// Collision based on: http://jsfiddle.net/ksmbx3fz/7/

const MAX_HORIZONTAL_SPEED = 1;
const MAX_VERTICAL_SPEED = 8;
export const PLAYER_HEIGHT = ClientConfig.PLAYER_HEIGHT;
export const PLAYER_WIDTH = ClientConfig.PLAYER_WIDTH;

export class PlayerSprite extends Phaser.GameObjects.Container {
   private prevPosition = new Vector2();
   private readonly gun: GunSprite;
   private readonly character: Phaser.GameObjects.Sprite;
   private jumping = false;
   private verticalSpeed = 0;
   // private readonly debugger: HitBoxDebugger;
   private dustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
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
      this.dustEmitter.reserve(1000);
      this.dustEmitter.stop();

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

   update(): void {
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

      if (this.prevPosition.x !== this.x || this.prevPosition.y !== this.y) {
         this.prevPosition.set(this.x, this.y);
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
         this.jumping = true;
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
               this.jumping = false;
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

      this.updateAmmo();
      this.gun.update();
      // this.debugger.update(this);
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

   private canJump(): boolean {
      return !this.jumping && Date.now() > this.lastJumpTimestamp + ClientConfig.TIME_BETWEEN_TWO_JUMP_MS;
   }

   private updateAmmo(): void {
      const newAmmo = Math.min(this.ammo + ClientConfig.AMMO_RESTORE_PER_S / 60, ClientConfig.MAX_AMMO);
      if (newAmmo !== this.ammo) {
         this.options.callbacks.onAmmoChanged(newAmmo);
      }
      this.ammo = newAmmo;
   }
}
