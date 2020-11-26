import { Inject, Singleton } from 'typescript-ioc';
import { PlayerStore } from '../../shared/player/player-store';
import { Player } from '../../shared/player/player-model';
import { Subject } from 'rxjs';
import { PlayerSprite } from './player-sprite';
import { BulletFireOptions } from '../bullet/default-bullet';
import { Vector } from '../../shared/bullet/vector-model';
import { filter } from 'rxjs/operators';

@Singleton
export class ClientPlayerComponent {
   private readonly clientInitSubject = new Subject<Player>();
   readonly clientInit$ = this.clientInitSubject.asObservable();
   private readonly clientShootingSubject = new Subject<BulletFireOptions>();
   readonly clientShooting$ = this.clientShootingSubject.asObservable();

   private clientId?: string;
   private clientPlayer: PlayerSprite;

   private readonly clientCheeseCountChangedSubject = new Subject<number>();
   readonly clientCheeseCountChanged$ = this.clientCheeseCountChangedSubject.asObservable();

   constructor(@Inject private readonly store: PlayerStore) {}

   setClientPlayer(player: Player): void {
      this.clientId = player.id;
      this.store.commit(player.id, player);
      this.clientInitSubject.next(player);
      this.store.update(player.id, player);
      this.store
         .onUpdatedId(player.id)
         .pipe(filter((player) => player.cheese !== undefined))
         .subscribe((player) => this.clientCheeseCountChangedSubject.next(player.cheese));
      this.subscribeOnUpdateToPlayerSprite();
   }

   setClientPlayerSprite(player: PlayerSprite): void {
      this.clientPlayer = player;
   }

   getClientId(): string | undefined {
      return this.clientId;
   }

   getClient(): Player {
      return this.store.get(this.clientId);
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
      this.store.onUpdatedId(this.clientId).subscribe((player) => {
         if (player.position) {
            this.clientPlayer.setPosition(player.position.x, player.position.y);
         }
         if (player.cheese !== undefined) {
            console.log(`My amount of cheese is changed to ${player.cheese}`);
         }
      });
   }
}
