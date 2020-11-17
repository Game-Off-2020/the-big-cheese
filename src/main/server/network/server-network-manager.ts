import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkComponent } from './server-network-component';
import { PlayerStore } from '../../shared/player/player-store';
import { Store } from '../../shared/store/store';
import { filter, map } from 'rxjs/operators';
import { ServerMapComponent } from '../map/server-map-component';
import { MapStore } from '../../shared/map/map-store';
import { BulletStore } from '../../shared/bullet/bullet-store';
import { StoreEntity } from '../../shared/store/store-model';
import { Observable } from 'rxjs';
import { IObject } from '../../shared/util/util-model';

@Singleton
export class ServerNetworkManager {
   constructor(
      @Inject private readonly component: ServerNetworkComponent,
      @Inject private readonly map: ServerMapComponent,
      @Inject private readonly playerStore: PlayerStore,
      @Inject private readonly mapStore: MapStore,
      @Inject private readonly bulletStore: BulletStore,
   ) {
      this.subscribeNetworkUpdateToStore(playerStore);
      this.subscribeStoreToNetworkExceptEntity(this.playerStore, this.playerStore.updated$);
      this.subscribeStoreToNetwork(playerStore, playerStore.committed$);
      this.subscribeStoreToNetwork(mapStore, mapStore.committed$);
      this.subscribeSendLoginResponseOnPlayerAddedToNetwork();
   }

   // Updates from the network will be merged into the store
   private subscribeNetworkUpdateToStore(store: Store): void {
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

   // Event in the store will be send out everyone
   private subscribeStoreToNetwork<T extends string | IObject>(store: Store, event: Observable<StoreEntity<T>>): void {
      event.subscribe((entity) => {
         this.component.sendDataStore(this.playerStore.getIds(), store.getId(), entity.id, entity.value);
      });
   }
   // Event in the store will be send out everyone except entity id
   private subscribeStoreToNetworkExceptEntity<T extends string | IObject>(
      store: Store,
      event: Observable<StoreEntity<T>>,
   ): void {
      event.subscribe((entity) => {
         this.component.sendDataStore(
            this.playerStore.getIds().filter((id) => id !== entity.id),
            store.getId(),
            entity.id,
            entity.value,
         );
      });
   }

   // Send login response when player added
   private subscribeSendLoginResponseOnPlayerAddedToNetwork(): void {
      this.playerStore.added$.subscribe((entity) => {
         this.component.sendLoginResponse(entity.id, {
            userId: entity.id,
            map: {
               buffer: this.map.getMap(),
               size: this.map.getSize(),
            },
         });
      });
   }
}
