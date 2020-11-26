import { Inject, Singleton } from 'typescript-ioc';
import { ClientNetworkComponent } from './client-network-component';
import { ClientPlayerComponent } from '../player/client-player-component';
import { PlayerStore } from '../../shared/player/player-store';
import { Store } from '../../shared/store/store';
import { filter, map } from 'rxjs/operators';
import { MapStore } from '../../shared/map/map-store';
import { ClientGameStateComponent } from '../game-state/client-game-state-component';
import { BulletStore } from '../../shared/bullet/bullet-store';
import { CheeseStore } from '../../shared/cheese/cheese-store';
import { GameStateStore } from '../../shared/game-state/game-state-store';

@Singleton
export class ClientNetworkManager {
   constructor(
      @Inject private readonly component: ClientNetworkComponent,
      @Inject private readonly gameState: ClientGameStateComponent,
      @Inject private readonly player: ClientPlayerComponent,
      @Inject private readonly playerStore: PlayerStore,
      @Inject private readonly mapStore: MapStore,
      @Inject private readonly bulletStore: BulletStore,
      @Inject private readonly cheeseStore: CheeseStore,
      @Inject private readonly gameStateStore: GameStateStore,
   ) {
      gameState.joinGame$.subscribe((request) => {
         component.connect();
         component.sendJoinRequest(request);
      });
      player.clientInit$.subscribe((player) => {
         this.subscribeStoreOnCommitToNetwork(playerStore, player.id);
         this.subscribeNetworkUpdateToStore(playerStore);
         this.subscribeNetworkUpdateToStore(mapStore);
         this.subscribeNetworkUpdateToStore(bulletStore);
         this.subscribeNetworkUpdateToStore(cheeseStore);
         this.subscribeNetworkUpdateToStore(gameStateStore);
      });
      player.clientShooting$.subscribe((shootingOptions) => {
         component.sendShootRequest(shootingOptions);
      });
   }

   // Commits to the store value will be sent to the network
   private subscribeStoreOnCommitToNetwork<T>(store: Store<T>, id: string): void {
      store.onCommittedId(id).subscribe((value) => {
         this.component.sendDataStore(store.getId(), id, value);
      });
   }

   // Updates from the network will be merged into the store
   private subscribeNetworkUpdateToStore<T>(store: Store<T>): void {
      this.component.dataStore$
         .pipe(
            filter((stores) => Object.keys(stores)[0] === store.getId()),
            map((stores) => Array.from(Object.entries(stores[store.getId()]))),
         )
         .subscribe((storeDataEntries) => {
            storeDataEntries.forEach(([id, entity]) => {
               // console.log(`Store ${store.getId()} received entity ${id}:`, entity);
               // null values can go through the network but it means that it should be removed
               if (entity === null) {
                  store.remove(id);
               } else {
                  store.update(id, entity);
               }
            });
         });
   }
}
