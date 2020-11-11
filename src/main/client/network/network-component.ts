import { Inject, Singleton } from 'typescript-ioc';
import { BufferedNetworkComponent } from './buffered-network-component';
import { Store } from '../../shared/store/store';
import { NetworkEvent } from './network-model';
import { Utils } from '../../shared/util/utils';
import { IObject } from '../../shared/util/util-model';

@Singleton
export class NetworkComponent {
   constructor(@Inject private readonly bufferedNetwork: BufferedNetworkComponent) {}

   subscribeStoreOnCommit(store: Store<IObject>, id: string): void {
      store.onCommittedId(id).subscribe((entity) => {
         this.bufferedNetwork.send(
            NetworkEvent.DATA_STORE,
            Utils.keyValueObject(store.getId(), Utils.keyValueObject(id, entity)),
         );
      });
   }
}
