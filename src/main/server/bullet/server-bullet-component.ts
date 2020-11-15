import { Inject, Singleton } from 'typescript-ioc';
import { BulletStore } from '../../shared/bullet/bullet-store';
import { Utils } from '../../shared/util/utils';
import { ServerPlayerComponent } from '../player/server-player-component';

@Singleton
export class ServerBulletComponent {
   constructor(@Inject private readonly store: BulletStore, @Inject private readonly players: ServerPlayerComponent) {}

   shoot(playerId: string): void {
      const player = this.players.getPlayer(playerId);
      if (player) {
         this.createBullet(playerId, player.position.x, player.position.y, player.direction.x, player.direction.y);
      }
   }

   private createBullet(
      playerId: string,
      positionX: number,
      positionY: number,
      directionX: number,
      directionY: number,
   ): void {
      this.store.commit(Utils.generateId(), {
         playerId,
         position: {
            x: positionX,
            y: positionY,
         },
         direction: {
            x: directionX,
            y: directionY,
         },
      });
   }
}