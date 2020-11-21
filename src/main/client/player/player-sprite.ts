// Collision based on: http://jsfiddle.net/ksmbx3fz/7/
import * as Phaser from 'phaser';
import { Subject } from 'rxjs';
import { GunSprite } from './gun-sprite';
import { VectorUtil } from '../util/vector-util';
import { ClientConfig } from '../config/client-config';
import Vector2 = Phaser.Math.Vector2;

interface PlayerOptions {
   readonly scene: Phaser.Scene;
   readonly cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
   readonly callbacks: {
      readonly onShoot: (position: Phaser.Math.Vector2) => void;
   };
   readonly physics: {
      readonly leftWallCollision: (player: PlayerSprite, width: number, height: number) => boolean;
      readonly rightWallCollision: (player: PlayerSprite, width: number, height: number) => boolean;
      readonly floorCollision: (player: PlayerSprite, width: number, height: number) => boolean;
      readonly ceilingCollision: (player: PlayerSprite, width: number, height: number) => boolean;
   };
}

const MAX_HORIZONTAL_SPEED = 3;
const MAX_VERTICAL_SPEED = 10;
const PLAYER_HEIGHT = 40;
const PLAYER_WIDTH = 10;

export class PlayerSprite extends Phaser.GameObjects.Container {
   private prevPosition = new Vector2();
   private positionChangedSubject = new Subject<Vector2>();
   readonly positionChanged$ = this.positionChangedSubject.asObservable();
   private gun: GunSprite;
   private character: Phaser.GameObjects.Sprite;
   private jumping = false;
   private verticalSpeed = 0;
   private graphics: Phaser.GameObjects.Graphics;

   constructor(private readonly options: PlayerOptions) {
      super(options.scene, 0, 0);
      const config = {
         key: 'player1-walk',
         frames: options.scene.anims.generateFrameNumbers('player1', { frames: [0, 1, 2, 6, 7, 8] }),
         frameRate: 10,
         repeat: -1,
      };
      options.scene.anims.create(config);

      this.character = options.scene.make.sprite({ key: 'player1' });
      this.character.play('player1-walk');
      this.add(this.character);

      this.gun = new GunSprite({
         scene: options.scene,
         character: this.character,
         x: 30,
         y: -30,
      });
      this.add(this.gun);

      options.scene.add.existing(this);

      this.character.setOrigin(0.5, 1);
      this.graphics = this.scene.add.graphics();
   }

   private lastShootTimestamp = 0;

   update(): void {
      this.setRotation(VectorUtil.getFloorVector(this).scale(-1).angle());

      const direction = VectorUtil.getRelativeMouseDirection(this.options.scene, this).rotate(-this.rotation);

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
      }

      if (this.options.cursorKeys.left.isDown) {
         this.character.anims.play('player1-walk', true);
         for (let _ = 0; _ < MAX_HORIZONTAL_SPEED; _++) {
            if (!this.options.physics.leftWallCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.moveLeft(this);
            }
            while (this.options.physics.floorCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.applyGroundReactionForce(this);
            }
         }
      } else if (this.options.cursorKeys.right.isDown) {
         this.character.anims.play('player1-walk', true);
         for (let _ = 0; _ < MAX_HORIZONTAL_SPEED; _++) {
            if (!this.options.physics.rightWallCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.moveRight(this);
            }
            while (this.options.physics.floorCollision(this, PLAYER_WIDTH, PLAYER_HEIGHT)) {
               VectorUtil.applyGroundReactionForce(this);
            }
         }
      } else {
         this.character.anims.pause();
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
               new Vector2({ x: this.gun.x, y: this.gun.y }).rotate(this.rotation),
            );
            this.options.callbacks.onShoot(gunPosition);
         }
      }

      this.gun.update();
      this.drawDebug();
   }

   private drawDebug(): void {
      this.graphics.clear();
      this.graphics.lineStyle(2, 0xff0000, 1);

      const f = VectorUtil.createLocalWall(this, 2);
      const locationOfLeftWall = new Phaser.Math.Vector2({ x: this.x, y: this.y })
         .subtract(VectorUtil.getFloorVector(this).scale(-PLAYER_WIDTH / 2))
         .add(VectorUtil.getUpwardVector(this).scale(PLAYER_HEIGHT));
      this.graphics.lineBetween(
         locationOfLeftWall.x,
         locationOfLeftWall.y,
         locationOfLeftWall.x + f[f.length - 1].x,
         locationOfLeftWall.y + f[f.length - 1].y,
      );

      const locationOfRightWall = new Phaser.Math.Vector2({ x: this.x, y: this.y })
         .subtract(VectorUtil.getFloorVector(this).scale(PLAYER_WIDTH / 2))
         .add(VectorUtil.getUpwardVector(this).scale(PLAYER_HEIGHT));

      this.graphics.lineBetween(
         locationOfRightWall.x,
         locationOfRightWall.y,
         locationOfRightWall.x + f[f.length - 1].x,
         locationOfRightWall.y + f[f.length - 1].y,
      );

      const g = VectorUtil.createLocalFloor(this, PLAYER_WIDTH);

      const locationOfFloor = new Phaser.Math.Vector2({ x: this.x, y: this.y }).subtract(
         VectorUtil.getFloorVector(this).scale(PLAYER_WIDTH / 2),
      );

      this.graphics.lineBetween(
         locationOfFloor.x,
         locationOfFloor.y,
         locationOfFloor.x + g[g.length - 1].x,
         locationOfFloor.y + g[g.length - 1].y,
      );

      const locationOfCeiling = new Phaser.Math.Vector2({ x: this.x, y: this.y })
         .subtract(VectorUtil.getFloorVector(this).scale(PLAYER_WIDTH / 2))
         .add(VectorUtil.getUpwardVector(this).scale(PLAYER_HEIGHT));

      this.graphics.lineBetween(
         locationOfCeiling.x,
         locationOfCeiling.y,
         locationOfCeiling.x + g[g.length - 1].x,
         locationOfCeiling.y + g[g.length - 1].y,
      );
   }
}
