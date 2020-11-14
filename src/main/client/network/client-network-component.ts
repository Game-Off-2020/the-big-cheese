import { Inject, Singleton } from 'typescript-ioc';
import { ClientBufferedNetworkComponent } from './client-buffered-network-component';
import { Observable } from 'rxjs';
import { LoginResponse, NetworkEvent, NetworkMessage } from '../../shared/network/shared-network-model';
import { IObject } from '../../shared/util/util-model';
import { filter, map, tap } from 'rxjs/internal/operators';
import { Utils } from '../../shared/util/utils';

@Singleton
export class ClientNetworkComponent {
   readonly connected$: Observable<void>;
   readonly disconnected$: Observable<void>;
   private event$: Observable<NetworkMessage>;
   readonly loginResponse$: Observable<LoginResponse>;
   readonly dataStore$: Observable<IObject>;

   constructor(@Inject private readonly bufferedNetwork: ClientBufferedNetworkComponent) {
      this.connected$ = bufferedNetwork.connected$;
      this.disconnected$ = bufferedNetwork.disconnected$;
      this.event$ = bufferedNetwork.data$;
      this.loginResponse$ = this.onEvent(NetworkEvent.LOGIN_RESPONSE) as Observable<LoginResponse>;
      this.dataStore$ = this.onEvent(NetworkEvent.DATA_STORE) as Observable<IObject>;
   }

   private onEvent(event: NetworkEvent): Observable<IObject> {
      return this.event$.pipe(
         tap((message) => console.log(message)),
         filter((message) => message.event === event),
         map((message) => message.value),
      );
   }

   sendDataStore(storeId: string, id: string, value: IObject): void {
      const data = Utils.keyValueObject(storeId, Utils.keyValueObject(id, value));
      this.bufferedNetwork.send(NetworkEvent.DATA_STORE, data);
   }
}
