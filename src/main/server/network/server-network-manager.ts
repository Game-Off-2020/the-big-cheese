import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkComponent } from './server-network-component';
import { PlayerStore } from '../../shared/player/player-store';
import { Store } from '../../shared/store/store';
import { filter, map } from 'rxjs/operators';

@Singleton
export class ServerNetworkManager {
   constructor(
      @Inject private readonly component: ServerNetworkComponent,
      @Inject private readonly playerStore: PlayerStore,
   ) {
      this.subscribeUpdateToStore(playerStore);
      this.subscribeStoreOnCommit();
      this.subscribeSendLoginResponseOnPlayerAdded();
      this.subscribePlayerStoreOnUpdate();
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
               console.log(`Store ${store.getId()} received entity ${id}:`, value);
               if (value !== null) {
                  store.update(id, value);
               }
            });
         });
   }

   // Changes in the store will be send out everyone
   private subscribeStoreOnCommit(): void {
      this.playerStore.committed$.subscribe((entity) => {
         this.component.sendDataStore(this.playerStore.getIds(), this.playerStore.getId(), entity.id, entity.value);
      });
   }

   // Send login response when player added
   private subscribeSendLoginResponseOnPlayerAdded(): void {
      this.playerStore.added$.subscribe((entity) => {
         this.component.sendLoginResponse(entity.id, { id: entity.id });
      });
   }

   // Changes in the store will be send out everyone except the user who made the change
   private subscribePlayerStoreOnUpdate(): void {
      this.playerStore.updated$.subscribe((entity) => {
         this.component.sendDataStore(
            this.playerStore.getIds().filter((id) => id !== entity.id),
            this.playerStore.getId(),
            entity.id,
            entity.value,
         );
      });
   }
}
