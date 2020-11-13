import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkComponent } from './server-network-component';
import { Store } from '../../shared/store/store';
import { filter, map } from 'rxjs/operators';
import { PlayerStore } from '../../shared/player/player-store';
import { Player } from '../../shared/player/player-model';

@Singleton
export class ServerNetworkManager {
   constructor(
      @Inject private readonly component: ServerNetworkComponent,
      @Inject private readonly playerStore: PlayerStore,
   ) {
      // TODO: When the player connects we need to store it until it sends a login message with its name and settings (room etc)
      // TODO: Now we just create the player as if it had already sent this login message
      // TODO: Move to ServerPlayerManager and here subscribe for playerStore added to send out the loginresponse with the id
      component.clientConnectedId$.subscribe((id) => {
         this.component.sendLoginResponse(id, { id });
         this.addUser(id);
      });
      this.subscribeUpdateToStore(playerStore);
      this.subscribePlayerStoreOnUpdate(playerStore);
      this.subscribeStoreOnCommit(playerStore);
   }

   // TODO: Move to ServerPlayerManager
   private addUser(id: string): void {
      this.playerStore.commit(id, {
         id,
         name: id,
         position: {
            x: 0,
            y: 0,
         },
      } as Player);
   }

   // Updates from the network will be merged into the store
   // TODO: Move to ServerPlayerManager
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

   // TODO: Move to ServerPlayerManager
   // Changes in the store will be send out everyone except the user who made the change
   private subscribePlayerStoreOnUpdate(store: PlayerStore): void {
      store.updated$.subscribe((entity) => {
         this.component.sendDataStore(
            this.playerStore.getIds().filter((id) => id !== entity.id),
            store.getId(),
            entity.id,
            entity.value,
         );
      });
   }

   // Changes in the store will be send out everyone
   private subscribeStoreOnCommit(store: Store): void {
      store.committed$.subscribe((entity) => {
         this.component.sendDataStore(this.playerStore.getIds(), store.getId(), entity.id, entity.value);
      });
   }
}
