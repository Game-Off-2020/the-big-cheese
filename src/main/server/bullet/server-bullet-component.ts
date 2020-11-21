import { Inject, Singleton } from 'typescript-ioc';
import { Utils } from '../../shared/util/utils';
import { ServerPlayerComponent } from '../player/server-player-component';
import { ServerMapComponent } from '../map/server-map-component';
import { ShootRequest } from '../../shared/network/shared-network-model';
import { ServerConfig } from '../config/server-config';
import { MathUtil } from '../../client/util/math-util';
import { ServerBullet } from './server-bullet-model';
import { ServerBulletStore } from './server-bullet-store';

@Singleton
export class ServerBulletComponent {
   constructor(
      @Inject private readonly store: ServerBulletStore,
      @Inject private readonly players: ServerPlayerComponent,
      @Inject private readonly map: ServerMapComponent,
   ) {}

   shoot(playerId: string, shootRequest: ShootRequest): void {
      const player = this.players.getPlayer(playerId);
      if (player) {
         this.createBullet(
            playerId,
            shootRequest.position.x,
            shootRequest.position.y,
            shootRequest.direction.x,
            shootRequest.direction.y,
         );
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
         timestamp: Date.now(),
      });
   }

   private nextPosition = { x: 0, y: 0 };

   stepBullets(): void {
      this.map.updateData();
      for (const [id, bullet] of Object.entries(this.store.getData())) {
         this.stepBullet(id, bullet);
      }
   }

   stepBullet(id: string, bullet: ServerBullet): void {
      if (Date.now() > bullet.timestamp + ServerConfig.BULLET_MAX_AGE_MS) {
         // This bullet is too old, lets remove it
         this.store.remove(id);
         return;
      }

      this.nextPosition.x = bullet.position.x + bullet.direction.x * ServerConfig.BULLET_SPEED;
      this.nextPosition.y = bullet.position.y + bullet.direction.y * ServerConfig.BULLET_SPEED;

      // Check if it will hit a wall or player (?) using continuous collision detection
      const collision = this.map.raycast(
         bullet.position.x,
         bullet.position.y,
         this.nextPosition.x,
         this.nextPosition.y,
      );
      if (collision) {
         this.store.remove(id);
         this.map.destruct({
            position: {
               x: collision[0],
               y: collision[1],
            },
            radius: MathUtil.randomFloatFromInterval(10, 35) / ServerConfig.MAP_OUTPUT_SCALE,
         });
      } else {
         // We dont use store.commit here on purpose, unnecessary to sync with clients
         bullet.position.x = this.nextPosition.x;
         bullet.position.y = this.nextPosition.y;
      }
   }
}
