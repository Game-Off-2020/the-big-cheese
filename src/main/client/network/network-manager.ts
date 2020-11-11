import { Inject, Singleton } from 'typescript-ioc';
import { NetworkComponent } from './network-component';
import { PlayerComponent } from '../player/player-component';
import { PlayerStore } from '../../shared/player/player-store';
import { StoreNetworkComponent } from './store-network-component';

@Singleton
export class NetworkManager {
   constructor(
      @Inject private readonly component: NetworkComponent,
      @Inject private readonly storeNetwork: StoreNetworkComponent,
      @Inject private readonly player: PlayerComponent,
      @Inject private readonly playerStore: PlayerStore,
   ) {
      player.clientInit$.subscribe((player) => {
         storeNetwork.subscribeStoreOnCommit(playerStore, player.id);
         storeNetwork.subscribeStoreOnUpdate(playerStore);
      });
   }
}
