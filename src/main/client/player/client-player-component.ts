import { Inject, Singleton } from 'typescript-ioc';
import { PlayerStore } from '../../shared/player/player-store';
import { Player } from '../../shared/player/player-model';
import { Subject } from 'rxjs';
import { PlayerSprite } from './player-sprite';
import { filter, map } from 'rxjs/operators';
import { BulletFireOptions } from '../bullet/default-bullet';

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
      this.store.commit(player.id, player);
      this.clientInitSubject.next(player);
      this.store.update(player.id, player);
      this.subscribePlayerSpriteCommitToStore();
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

   // Wire client character from spriteX to store
   private subscribePlayerSpriteCommitToStore(): void {
      this.clientPlayer.positionChanged$.subscribe((position) => {
         this.store.commit(this.clientId, {
            position: {
               x: position.x,
               y: position.y,
            },
         } as Player);
      });
   }

   // Wire client character from store to sprite
   private subscribeOnUpdateToPlayerSprite(): void {
      this.store
         .onUpdatedId(this.clientId)
         .pipe(
            filter((playerData) => !!playerData.position),
            map((playerData) => playerData.position),
         )
         .subscribe((position) => {
            // TODO: Might need to calculate relative position in the client?
            console.log('Player position updated');
            this.clientPlayer.setPosition(position.x, position.y);
         });
   }
}
