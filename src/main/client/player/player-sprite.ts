// Collision based on: http://jsfiddle.net/ksmbx3fz/7/
import * as Phaser from 'phaser';
import { Subject } from 'rxjs';
import { GunSprite } from './gun-sprite';
import { VectorUtil } from '../util/vector-util';
import { ClientConfig } from '../config/client-config';
import { Vector } from '../../shared/bullet/vector-model';
import { HitBoxDebugger } from '../util/hitbox-debugger-util';
import { Keys } from '../config/constants';
import { PlayerType } from '../../shared/player/player-model';
import Vector2 = Phaser.Math.Vector2;

interface PlayerOptions {
   readonly scene: Phaser.Scene;
   readonly cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
   readonly callbacks: {
      readonly onStartMoving: () => void;
      readonly onStartStanding: () => void;
      readonly onPositionChanged: (position: Vector) => void;
      readonly onDirectionChanged: (position: Vector) => void;
      readonly onShoot: (position: Phaser.Math.Vector2) => void;
   };
   readonly physics: {
      readonly leftWallCollision: (player: PlayerSprite, width: number, height: number) => boolean;
      readonly rightWallCollision: (player: PlayerSprite, width: number, height: number) => boolean;
      readonly floorCollision: (player: PlayerSprite, width: number, height: number) => boolean;
      readonly ceilingCollision: (player: PlayerSprite, width: number, height: number) => boolean;
   };
}

const MAX_HORIZONTAL_SPEED = 1;
const MAX_VERTICAL_SPEED = 10;
export const PLAYER_HEIGHT = ClientConfig.PLAYER_HEIGHT;
export const PLAYER_WIDTH = ClientConfig.PLAYER_WIDTH;

export class PlayerSprite extends Phaser.GameObjects.Container {
   private prevPosition = new Vector2();
   private positionChangedSubject = new Subject<Vector2>();
   readonly positionChanged$ = this.positionChangedSubject.asObservable();
   private readonly gun: GunSprite;
   private readonly character: Phaser.GameObjects.Sprite;
   private jumping = false;
   private verticalSpeed = 0;
   private readonly debugger: HitBoxDebugger;

   constructor(private readonly options: PlayerOptions, private readonly playerType: PlayerType) {
      super(options.scene, 0, 0);
      // TODO: Use playerType
      console.log('player-sprite', playerType);
      this.setScale(1 / ClientConfig.MAP_OUTPUT_SCALE, 1 / ClientConfig.MAP_OUTPUT_SCALE);
      options.scene.anims.create({
         key: Keys.PLAYER_1_WALK,
         frames: options.scene.anims.generateFrameNumbers(Keys.PLAYER_1, { frames: [0, 1, 2, 6, 7, 8] }),
         frameRate: 10,
         repeat: -1,
      });
      options.scene.add.existing(this);
      this.add((this.character = options.scene.make.sprite({ key: Keys.PLAYER_1 })));
      this.add(
         (this.gun = new GunSprite({
            scene: options.scene,
            character: this.character,
            x: 30,
            y: -30,
         })),
      );
      this.character.setOrigin(0.5, 1);
      this.debugger = new HitBoxDebugger({ scene: this.scene });
      this.scene.add.existing(this.debugger);
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
         this.positionChangedSubject.next(this.prevPosition);
         this.options.callbacks.onPositionChanged(this.prevPosition);
      }

      if (this.options.cursorKeys.left.isDown) {
         this.moving();
         for (let _ = 0; _ < MAX_HORIZONTAL_SPEED; _++) {
            if (!this.options.physics.leftWallCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.moveLeft(this);
            }
            while (this.options.physics.floorCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.applyGroundReactionForce(this);
            }
         }
      } else if (this.options.cursorKeys.right.isDown) {
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

      if (this.options.cursorKeys.up.isDown && !this.jumping) {
         this.verticalSpeed = -MAX_VERTICAL_SPEED;
         this.jumping = true;
      }

      this.verticalSpeed += 1;
      // this.verticalSpeed = Phaser.Math.Clamp(this.verticalSpeed, -MAX_VERTICAL_SPEED, MAX_VERTICAL_SPEED);

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
         if (Date.now() > this.lastShootTimestamp + ClientConfig.SHOOT_INTERVAL) {
            this.lastShootTimestamp = Date.now();
            const gunPosition = new Vector2({ x: this.x, y: this.y }).add(
               new Vector2({
                  x: this.gun.x / ClientConfig.MAP_OUTPUT_SCALE,
                  y: this.gun.y / ClientConfig.MAP_OUTPUT_SCALE,
               }).rotate(this.rotation),
            );
            this.options.callbacks.onShoot(gunPosition);
         }
      }

      this.gun.update();
      this.debugger.update(this);
   }

   private isMoving = false;

   private moving(): void {
      if (!this.isMoving) {
         this.isMoving = true;
         this.options.callbacks.onStartMoving();
         this.character.anims.play(Keys.PLAYER_1_WALK, true);
      }
   }

   private standing(): void {
      if (this.isMoving) {
         this.isMoving = false;
         this.options.callbacks.onStartStanding();
         this.character.anims.pause();
      }
   }
}
