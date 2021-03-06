import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkWrapper } from './server-network-wrapper';
import { Observable } from 'rxjs';
import { ServerNetworkMessage } from './server-network-model';
import {
   JoinRequest,
   JoinResponse,
   MapUpdateResponse,
   NetworkEvent,
   ShootRequest,
} from '../../shared/network/shared-network-model';
import { filter, map } from 'rxjs/internal/operators';
import { Utils } from '../../shared/util/utils';
import { AllStores } from '../../shared/models/all-stores';
import { StoreData } from '../../shared/store/store-model';

@Singleton
export class ServerNetworkComponent {
   readonly clientConnectedId$: Observable<string>;
   readonly clientDisconnectedId$: Observable<string>;
   private event$: Observable<ServerNetworkMessage>;
   readonly dataStore$: Observable<{ [key: string]: AllStores }>;
   readonly joinRequest$: Observable<ServerNetworkMessage<JoinRequest>>;
   readonly shootRequest$: Observable<ServerNetworkMessage<ShootRequest>>;

   constructor(@Inject private readonly wrapper: ServerNetworkWrapper) {
      this.clientConnectedId$ = wrapper.clientConnectedId$;
      this.clientDisconnectedId$ = wrapper.clientDisconnectedId$;
      this.event$ = wrapper.clientEvent$;
      this.dataStore$ = this.onEvent(NetworkEvent.DATA_STORE);
      this.joinRequest$ = this.onMessage<JoinRequest>(NetworkEvent.JOIN_REQUEST);
      this.shootRequest$ = this.onMessage<ShootRequest>(NetworkEvent.SHOOT_REQUEST);
   }

   private onEvent<T>(event: NetworkEvent): Observable<T> {
      return this.onMessage<T>(event).pipe(map((message) => message.value));
   }

   private onMessage<T>(event: NetworkEvent): Observable<ServerNetworkMessage<T>> {
      return this.event$.pipe(
         filter((message) => message.event === event),
         map((message) => (message as unknown) as ServerNetworkMessage<T>),
      );
   }

   sendLoginResponse(user: string, response: JoinResponse): void {
      this.wrapper.send(user, { event: NetworkEvent.JOIN_RESPONSE, value: response });
   }

   sendDataStoreValue<T>(users: string[], storeId: string, id: string, value: T): void {
      this.sendDataStore(users, storeId, Utils.keyValueObject(id, value));
   }

   sendDataStore<T>(users: string[], storeId: string, data: StoreData<T>): void {
      users.forEach((user) =>
         this.wrapper.send(user, {
            event: NetworkEvent.DATA_STORE,
            value: Utils.keyValueObject(storeId, data),
         }),
      );
   }

   sendMapUpdate(users: string[], buffer: Buffer): void {
      users.forEach((user) =>
         this.wrapper.send(user, {
            event: NetworkEvent.MAP_UPDATE,
            value: {
               buffer,
            } as MapUpdateResponse,
         }),
      );
   }
}
