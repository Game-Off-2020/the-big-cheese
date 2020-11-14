import { Inject, Singleton } from 'typescript-ioc';
import { PlayerStore } from '../../shared/player/player-store';
import { Player } from '../../shared/player/player-model';
import { Subject } from 'rxjs';

@Singleton
export class ClientPlayerComponent {
   private readonly clientInitSubject = new Subject<Player>();
   readonly clientInit$ = this.clientInitSubject.pipe();

   private clientId?: string;

   constructor(@Inject private readonly store: PlayerStore) {}

   initClientPlayer(player: Player): void {
      this.clientId = player.id;
      this.store.commit(player.id, player);
      this.clientInitSubject.next(player);
   }

   commitClientPosition(x: number, y: number): void {
      this.store.commit(this.clientId, { position: { x, y } } as Player);
   }
}
