import { Inject, Singleton } from 'typescript-ioc';
import { PlayerStore } from '../../shared/player/player-store';
import { Player } from '../../shared/player/player-model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ClientPlayerComponent } from './client-player-component';

@Singleton
export class ClientOtherPlayerComponent {
   readonly added$: Observable<Player>;
   readonly removed$: Observable<string>;

   constructor(
      @Inject private readonly clientPlayer: ClientPlayerComponent,
      @Inject private readonly store: PlayerStore,
   ) {
      this.added$ = store.added$.pipe(
         // filter((playerEntity) => playerEntity.id !== clientPlayer.getClientId()),
         map((entity) => entity.value),
      );
      this.removed$ = store.removed$;
   }
}
