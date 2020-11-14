import { Inject, Singleton } from 'typescript-ioc';
import { ClientNetworkComponent } from './client-network-component';
import { ClientPlayerComponent } from '../player/client-player-component';
import { PlayerStore } from '../../shared/player/player-store';
import { Store } from '../../shared/store/store';
import { filter, map } from 'rxjs/operators';
import { MapStore } from '../../shared/map/map-store';

@Singleton
export class ClientNetworkManager {
   constructor(
      @Inject private readonly component: ClientNetworkComponent,
      @Inject private readonly player: ClientPlayerComponent,
      @Inject private readonly playerStore: PlayerStore,
      @Inject private readonly mapStore: MapStore,
   ) {
      player.clientInit$.subscribe((player) => {
         this.subscribeStoreOnCommit(playerStore, player.id);
         this.subscribeNetworkUpdateStore(playerStore);
         this.subscribeNetworkUpdateStore(mapStore);
      });
   }

   // Commits to the store value will be sent to the network
   private subscribeStoreOnCommit(store: Store, id: string): void {
      store.onCommittedId(id).subscribe((value) => {
         this.component.sendDataStore(store.getId(), id, value);
      });
   }

   // Updates from the network will be merged into the store
   private subscribeNetworkUpdateStore(store: Store): void {
      this.component.dataStore$
         .pipe(
            map((stores) => stores[store.getId()]),
            filter((storeData) => !!storeData),
            map((storeData) => Array.from(Object.entries(storeData))),
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
