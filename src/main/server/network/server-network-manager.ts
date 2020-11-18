import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkComponent } from './server-network-component';
import { PlayerStore } from '../../shared/player/player-store';
import { Store } from '../../shared/store/store';
import { filter, map } from 'rxjs/operators';
import { ServerMapComponent } from '../map/server-map-component';
import { MapStore } from '../../shared/map/map-store';
import { StoreEntity } from '../../shared/store/store-model';
import { Observable } from 'rxjs';
import { ServerBulletStore } from '../bullet/server-bullet-store';

@Singleton
export class ServerNetworkManager {
   constructor(
      @Inject private readonly component: ServerNetworkComponent,
      @Inject private readonly map: ServerMapComponent,
      @Inject private readonly playerStore: PlayerStore,
      @Inject private readonly mapStore: MapStore,
      @Inject private readonly bulletStore: ServerBulletStore,
   ) {
      this.subscribeNetworkUpdateToStore(playerStore);
      this.subscribeStoreToNetworkExceptEntity(this.playerStore, this.playerStore.updated$);
      this.subscribeStoreToNetwork(playerStore, playerStore.committed$);
      this.subscribeStoreToNetwork(mapStore, mapStore.committed$);
      this.subscribeStoreToNetwork(bulletStore, bulletStore.committed$);
      this.subscribeSendLoginResponseOnPlayerAddedToNetwork();
   }

   // Updates from the network will be merged into the store
   private subscribeNetworkUpdateToStore<T>(store: Store<T>): void {
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
                  store.update(id, value as T);
               }
            });
         });
   }

   // Event in the store will be send out everyone
   private subscribeStoreToNetwork<T>(store: Store<T>, event: Observable<StoreEntity<T>>): void {
      event.subscribe((entity) => {
         this.component.sendDataStore(this.playerStore.getIds(), store.getId(), entity.id, entity.value);
      });
   }

   // Event in the store will be send out everyone except entity id
   private subscribeStoreToNetworkExceptEntity<T>(store: Store<T>, event: Observable<StoreEntity<T>>): void {
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
