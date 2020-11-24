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
import { JoinResponseStatus } from '../../shared/network/shared-network-model';
import { CheeseStore } from '../../shared/cheese/cheese-store';
import { GameStateStore } from '../../shared/game-state/game-state-store';

@Singleton
export class ServerNetworkManager {
   constructor(
      @Inject private readonly component: ServerNetworkComponent,
      @Inject private readonly map: ServerMapComponent,
      @Inject private readonly playerStore: PlayerStore,
      @Inject private readonly mapStore: MapStore,
      @Inject private readonly bulletStore: ServerBulletStore,
      @Inject private readonly cheeseStore: CheeseStore,
      @Inject private readonly gameStateStore: GameStateStore,
   ) {
      this.subscribeNetworkUpdateToStore(playerStore);
      this.subscribeStoreToNetworkExceptEntity(this.playerStore, this.playerStore.updated$);
      this.subscribeStoreToNetwork(playerStore, playerStore.committed$);
      this.subscribeStoreToNetwork(mapStore, mapStore.committed$);
      this.subscribeStoreToNetwork(bulletStore, bulletStore.committed$);
      this.subscribeStoreToNetwork(cheeseStore, cheeseStore.committed$);
      this.subscribeStoreToNetwork(gameStateStore, gameStateStore.committed$);
      this.subscribeSendLoginResponseOnPlayerAddedToNetwork();

      // Need to send out these stores manually upon joining
      playerStore.added$.subscribe((playerEntity) => {
         this.sendOutStore(playerEntity.id, playerStore);
         this.sendOutStore(playerEntity.id, cheeseStore);
         this.sendOutStore(playerEntity.id, gameStateStore);
      });
   }

   private sendOutStore<T>(playerId: string, store: Store<T>): void {
      this.component.sendDataStore([playerId], store.getId(), store.getData());
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
         this.component.sendDataStoreValue(this.playerStore.getIds(), store.getId(), entity.id, entity.value);
      });
   }

   // Event in the store will be send out everyone except entity id
   private subscribeStoreToNetworkExceptEntity<T>(store: Store<T>, event: Observable<StoreEntity<T>>): void {
      event.subscribe((entity) => {
         this.component.sendDataStoreValue(
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
            status: JoinResponseStatus.JOINED,
            userId: entity.id,
            map: {
               buffer: this.map.getMap(),
               size: this.map.getCanvasSize(),
            },
         });
      });
   }
}
