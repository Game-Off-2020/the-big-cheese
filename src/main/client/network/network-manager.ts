import { Inject, Singleton } from 'typescript-ioc';
import { NetworkComponent } from './network-component';
import { PlayerComponent } from '../player/player-component';
import { PlayerStore } from '../../shared/player/player-store';

@Singleton
export class NetworkManager {
   constructor(
      @Inject private readonly component: NetworkComponent,
      @Inject private readonly player: PlayerComponent,
      @Inject private readonly playerStore: PlayerStore,
   ) {
      player.clientInit$.subscribe((player) => component.subscribeStoreOnCommit(playerStore, player.id));
   }
}
