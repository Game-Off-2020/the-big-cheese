import { Inject, Singleton } from 'typescript-ioc';
import { Utils } from '../../shared/util/utils';
import { ServerPlayerComponent } from '../player/server-player-component';
import { ServerMapComponent } from '../map/server-map-component';
import { ShootRequest } from '../../shared/network/shared-network-model';
import { ServerConfig } from '../config/server-config';
import { MathUtil } from '../../client/util/math-util';
import { Damage, ServerBullet } from './server-bullet-model';
import { ServerBulletStore } from './server-bullet-store';
import { Subject } from 'rxjs';
import { Vector } from '../../shared/bullet/vector-model';
import { Destruction } from '../../shared/map/map-model';

@Singleton
export class ServerBulletComponent {
   private readonly damageSubject = new Subject<Damage>();
   private readonly mapDamageSubject = new Subject<Destruction>();
   private readonly playerDamageSubject = new Subject<Damage>();
   readonly damage$ = this.damageSubject.asObservable();
   readonly mapDamage$ = this.mapDamageSubject.asObservable();
   readonly playerDamage$ = this.playerDamageSubject.asObservable();

   constructor(
      @Inject private readonly store: ServerBulletStore,
      @Inject private readonly players: ServerPlayerComponent,
      @Inject private readonly map: ServerMapComponent,
   ) {}

   shoot(playerId: string, shootRequest: ShootRequest): void {
      const player = this.players.get(playerId);
      if (player) {
         const angle = Math.atan2(shootRequest.direction.y, shootRequest.direction.x);
         const randomPlusAngle = Math.random() * 0.15 - 0.075;
         const nrOfBullets = player.doubleBarrel ? 2 : 1;
         for (let i = 0; i < nrOfBullets; i++) {
            const direction: Vector = {
               x: Math.cos(angle + randomPlusAngle + 0.12 * i),
               y: Math.sin(angle + randomPlusAngle + 0.12 * i),
            };
            this.createBullet(playerId, shootRequest.position.x, shootRequest.position.y, direction.x, direction.y);
         }
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
      const mapCollision = this.map.raycast(
         bullet.position.x,
         bullet.position.y,
         this.nextPosition.x,
         this.nextPosition.y,
      );
      const playerCollision = this.players.raycast(
         bullet.position.x,
         bullet.position.y,
         this.nextPosition.x,
         this.nextPosition.y,
         bullet.playerId,
      );
      if (mapCollision || playerCollision) {
         this.store.remove(id);
         const position: Vector = {
            x: mapCollision ? mapCollision[0] : playerCollision[0],
            y: mapCollision ? mapCollision[1] : playerCollision[1],
         };
         const radius = MathUtil.randomFloatFromInterval(20, 60) / ServerConfig.MAP_OUTPUT_SCALE;
         this.damageSubject.next({
            position,
            radius,
            playerId: bullet.playerId,
            collidedPlayerId: playerCollision ? playerCollision[2] : null,
         });
         if (mapCollision) {
            this.mapDamageSubject.next({
               position,
               radius,
            });
         } else {
            this.playerDamageSubject.next({
               playerId: bullet.playerId,
               position,
               radius,
               collidedPlayerId: playerCollision[2],
            });
         }
      } else {
         // We dont use store.commit here on purpose, unnecessary to sync with clients
         bullet.position.x = this.nextPosition.x;
         bullet.position.y = this.nextPosition.y;
      }
   }

   removeAll(): void {
      for (const id of Object.keys(this.store.getData())) {
         this.store.remove(id);
      }
   }
}
