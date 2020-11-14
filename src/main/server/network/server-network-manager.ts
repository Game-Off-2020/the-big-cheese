import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkComponent } from './server-network-component';
import { PlayerStore } from '../../shared/player/player-store';
import { Store } from '../../shared/store/store';
import { filter, map } from 'rxjs/operators';
import { ServerMapComponent } from '../map/server-map-component';
import { ServerMapStore } from '../map/server-map-store';

@Singleton
export class ServerNetworkManager {
   constructor(
      @Inject private readonly component: ServerNetworkComponent,
      @Inject private readonly playerStore: PlayerStore,
      @Inject private readonly mapStore: ServerMapStore,
      @Inject private readonly map: ServerMapComponent,
   ) {
      this.subscribeUpdateToStore(playerStore);
      this.subscribeStoreOnUpdateExceptEntityId(this.playerStore);
      this.subscribeStoreOnCommit(playerStore);
      this.subscribeStoreOnCommit(mapStore);
      this.subscribeSendLoginResponseOnPlayerAdded();
   }

   // Updates from the network will be merged into the store
   private subscribeUpdateToStore(store: Store): void {
      this.component.dataStore$
         .pipe(
            map((stores) => stores[store.getId()]),
            filter((storeData) => !!storeData),
            map((storeData) => Array.from(Object.entries(storeData))),
         )
         .subscribe((storeDataEntries) => {
            storeDataEntries.forEach(([id, value]) => {
               // console.log(`Store ${store.getId()} received entity ${id}:`, value);
               if (value !== null) {
                  store.update(id, value);
               }
            });
         });
   }

   // Changes in the store will be send out everyone
   private subscribeStoreOnCommit(store: Store): void {
      store.committed$.subscribe((entity) => {
         this.component.sendDataStore(this.playerStore.getIds(), store.getId(), entity.id, entity.value);
      });
   }

   // Changes in the store will be send out everyone except the entity id (the user who made the change)
   private subscribeStoreOnUpdateExceptEntityId(store: Store): void {
      store.updated$.subscribe((entity) => {
         this.component.sendDataStore(
            this.playerStore.getIds().filter((id) => id !== entity.id),
            store.getId(),
            entity.id,
            entity.value,
         );
      });
   }

   // Send login response when player added
   private subscribeSendLoginResponseOnPlayerAdded(): void {
      this.playerStore.added$.subscribe((entity) => {
         this.component.sendLoginResponse(entity.id, {
            id: entity.id,
            map: {
               buffer: this.map.getMap(),
               size: this.map.getSize(),
            },
         });
      });
   }
}
