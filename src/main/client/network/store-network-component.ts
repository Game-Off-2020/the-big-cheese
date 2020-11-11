import { Inject, Singleton } from 'typescript-ioc';
import { Store } from '../../shared/store/store';
import { NetworkEvent } from './network-model';
import { Utils } from '../../shared/util/utils';
import { filter, map } from 'rxjs/operators';
import { NetworkComponent } from './network-component';

@Singleton
export class StoreNetworkComponent {
   constructor(@Inject private readonly component: NetworkComponent) {}

   // Commits to the store will be sent to the network
   subscribeStoreOnCommit(store: Store, id: string): void {
      store.onCommittedId(id).subscribe((entity) => {
         this.component.send(
            NetworkEvent.DATA_STORE,
            Utils.keyValueObject(store.getId(), Utils.keyValueObject(id, entity)),
         );
      });
   }

   // Updates from the network will be merged into the store
   subscribeStoreOnUpdate(store: Store): void {
      this.component
         .onEvent(NetworkEvent.DATA_STORE)
         .pipe(
            map((stores) => stores[store.getId()]),
            filter((storeData) => !!storeData),
            map((storeData) => Array.from(Object.entries(storeData))),
         )
         .subscribe((storeDataEntries) => {
            storeDataEntries.forEach(([id, entity]) => {
               console.log(`Store ${store.getId()} received entity #${id}:${entity}`);
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
