import * as Phaser from 'phaser';
import { Vector } from '../../shared/bullet/vector-model';
import { Player } from '../../shared/player/player-model';
import { ClientConfig } from '../config/client-config';
import { Keys } from '../config/client-constants';
import { PlayerSprite } from '../player/player-sprite';
import { MathUtil } from '../util/math-util';

export class PlayerPositionIndicatorOverlay extends Phaser.GameObjects.Container {
   private maxHeight: number;
   private maxWidth: number;

   private indicators = new Map<
      string,
      {
         delta: Player;
         readonly indicator: Phaser.GameObjects.Sprite;
      }
   >();

   constructor(scene: Phaser.Scene) {
      super(scene, scene.game.scale.width / 2, scene.game.scale.height / 2);

      scene.add.existing(this);

      this.maxHeight = scene.game.scale.height / 2 - 100;
      this.maxWidth = scene.game.scale.width / 2 - 100;

      this.setDepth(300);

      scene.scale.on(
         'resize',
         (gameSize: Phaser.Structs.Size) => {
            this.maxHeight = gameSize.height / 2 - 100;
            this.maxWidth = gameSize.width / 2 - 100;
            this.setPosition(gameSize.width / 2, gameSize.height / 2);
         },
         this,
      );
   }

   private calculateIndicatorPosition(delta: Player, playerSprite: PlayerSprite): Phaser.Math.Vector2 {
      const pointVector = this.getDistance(delta.position, playerSprite)
         .rotate(-playerSprite.rotation)
         .scale(ClientConfig.MAP_OUTPUT_SCALE);

      const indicatorPosition = new Phaser.Math.Vector2({
         x: MathUtil.clamp(pointVector.x, -this.maxWidth, this.maxWidth),
         y: MathUtil.clamp(pointVector.y, -this.maxHeight, this.maxHeight),
      });

      return indicatorPosition;
   }

   private getDistance(position: Vector, playerSprite: PlayerSprite): Phaser.Math.Vector2 {
      const playerPosition = new Phaser.Math.Vector2({ x: position.x, y: position.y });

      const currentPlayerPosition = new Phaser.Math.Vector2({ x: playerSprite.x, y: playerSprite.y });
      const pointVector = playerPosition.subtract(currentPlayerPosition);

      return pointVector;
   }

   update(playerSprite: PlayerSprite): void {
      if (!playerSprite) {
         return;
      }

      for (const [_, payload] of this.indicators) {
         const indicatorPosition = this.calculateIndicatorPosition(payload.delta, playerSprite);
         const largestSide =
            Math.max(this.scene.game.scale.width, this.scene.game.scale.height) / ClientConfig.MAP_OUTPUT_SCALE / 2;

         if (this.getDistance(payload.delta.position, playerSprite).length() < largestSide) {
            payload.indicator.setVisible(false);
         } else {
            payload.indicator.setVisible(true);
         }

         payload.indicator.setRotation(indicatorPosition.angle());
         payload.indicator.setPosition(indicatorPosition.x, indicatorPosition.y);
      }
   }

   showPlayerOnMap(playerId: string, delta: Player, playerSprite: PlayerSprite): void {
      if (!delta.position) {
         return;
      }

      if (!playerSprite) {
         return;
      }

      const indicatorPosition = this.calculateIndicatorPosition(delta, playerSprite);

      if (!this.indicators.has(playerId)) {
         const indicator = new Phaser.GameObjects.Sprite(
            this.scene,
            indicatorPosition.x,
            indicatorPosition.y,
            Keys.INDICATOR_ARROW,
         );
         indicator.setScale(2);
         indicator.setRotation(indicatorPosition.angle());
         this.add(indicator);
         this.indicators.set(playerId, {
            delta,
            indicator,
         });
      } else {
         const payload = this.indicators.get(playerId);
         payload.delta = delta;
      }
   }

   removePlayerOnMap(playerId: string): void {
      if (!this.indicators.has(playerId)) {
         return;
      }

      const payload = this.indicators.get(playerId);
      payload.indicator.destroy();
      this.indicators.delete(playerId);
   }
}
