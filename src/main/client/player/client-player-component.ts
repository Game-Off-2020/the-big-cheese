import { Inject, Singleton } from 'typescript-ioc';
import { PlayerStore } from '../../shared/player/player-store';
import { Player } from '../../shared/player/player-model';
import { Subject } from 'rxjs';
import { PlayerSprite } from './player-sprite';
import { filter } from 'rxjs/operators';
import { BulletFireOptions } from '../bullet/default-bullet';
import { Vector } from '../../shared/bullet/vector-model';

@Singleton
export class ClientPlayerComponent {
   private readonly clientInitSubject = new Subject<Player>();
   readonly clientInit$ = this.clientInitSubject.asObservable();
   private readonly clientShootingSubject = new Subject<BulletFireOptions>();
   readonly clientShooting$ = this.clientShootingSubject.asObservable();

   private clientId?: string;
   private clientPlayer: PlayerSprite;

   constructor(@Inject private readonly store: PlayerStore) {}

   setClientPlayer(player: Player): void {
      this.clientId = player.id;
      this.clientInitSubject.next(player);
      this.store.update(player.id, player);
      this.subscribeOnUpdateToPlayerSprite();
   }

   setClientPlayerSprite(player: PlayerSprite): void {
      this.clientPlayer = player;
   }

   getClientId(): string | undefined {
      return this.clientId;
   }

   shoot(options: BulletFireOptions): void {
      this.clientShootingSubject.next(options);
   }

   setMoving(moving: boolean): void {
      this.store.commit(this.clientId, { moving } as Player);
   }

   setPosition(position: Vector): void {
      this.store.commit(this.clientId, {
         position: {
            x: position.x,
            y: position.y,
         },
      } as Player);
   }

   setDirection(direction: Vector): void {
      this.store.commit(this.clientId, {
         direction: {
            x: direction.x,
            y: direction.y,
         },
      } as Player);
   }

   // Wire client character from store to sprite
   private subscribeOnUpdateToPlayerSprite(): void {
      this.store
         .onUpdatedId(this.clientId)
         .pipe(filter((playerData) => !!playerData.position))
         .subscribe((player) => {
            if (player.position) {
               this.clientPlayer.setPosition(player.position.x, player.position.y);
            }
         });
   }
}
