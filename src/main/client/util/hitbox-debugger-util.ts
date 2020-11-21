import * as Phaser from 'phaser';

import { Scene } from 'phaser';
import { PLAYER_HEIGHT, PLAYER_WIDTH } from '../player/player-sprite';
import { VectorUtil } from '../util/vector-util';

interface HitboxDebuggerOptions {
   readonly scene: Scene;
}

export class HitBoxDebugger extends Phaser.GameObjects.Graphics {
   constructor(private readonly options: HitboxDebuggerOptions) {
      super(options.scene);
   }

   update(sprite: Phaser.GameObjects.Components.Transform): void {
      this.clear();
      this.lineStyle(2, 0xff0000, 1);

      const f = VectorUtil.createLocalWall(sprite, 2);
      const locationOfLeftWall = new Phaser.Math.Vector2({ x: sprite.x, y: sprite.y })
         .subtract(VectorUtil.getFloorVector(sprite).scale(-PLAYER_WIDTH / 2))
         .add(VectorUtil.getUpwardVector(sprite).scale(PLAYER_HEIGHT));
      this.lineBetween(
         locationOfLeftWall.x,
         locationOfLeftWall.y,
         locationOfLeftWall.x + f[f.length - 1].x,
         locationOfLeftWall.y + f[f.length - 1].y,
      );

      const locationOfRightWall = new Phaser.Math.Vector2({ x: sprite.x, y: sprite.y })
         .subtract(VectorUtil.getFloorVector(sprite).scale(PLAYER_WIDTH / 2))
         .add(VectorUtil.getUpwardVector(sprite).scale(PLAYER_HEIGHT));

      this.lineBetween(
         locationOfRightWall.x,
         locationOfRightWall.y,
         locationOfRightWall.x + f[f.length - 1].x,
         locationOfRightWall.y + f[f.length - 1].y,
      );

      const g = VectorUtil.createLocalFloor(sprite, PLAYER_WIDTH);

      const locationOfFloor = new Phaser.Math.Vector2({ x: sprite.x, y: sprite.y }).subtract(
         VectorUtil.getFloorVector(sprite).scale(PLAYER_WIDTH / 2),
      );

      this.lineBetween(
         locationOfFloor.x,
         locationOfFloor.y,
         locationOfFloor.x + g[g.length - 1].x,
         locationOfFloor.y + g[g.length - 1].y,
      );

      const locationOfCeiling = new Phaser.Math.Vector2({ x: sprite.x, y: sprite.y })
         .subtract(VectorUtil.getFloorVector(sprite).scale(PLAYER_WIDTH / 2))
         .add(VectorUtil.getUpwardVector(sprite).scale(PLAYER_HEIGHT));

      this.lineBetween(
         locationOfCeiling.x,
         locationOfCeiling.y,
         locationOfCeiling.x + g[g.length - 1].x,
         locationOfCeiling.y + g[g.length - 1].y,
      );
   }
}
