import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkWrapper } from './server-network-wrapper';
import { Observable } from 'rxjs';
import { ServerNetworkMessage } from './server-network-model';
import { JoinRequest, JoinResponse, NetworkEvent } from '../../shared/network/shared-network-model';
import { IObject } from '../../shared/util/util-model';
import { filter, map } from 'rxjs/internal/operators';
import { Utils } from '../../shared/util/utils';

@Singleton
export class ServerNetworkComponent {
   readonly clientConnectedId$: Observable<string>;
   readonly clientDisconnectedId$: Observable<string>;
   private event$: Observable<ServerNetworkMessage>;
   readonly dataStore$: Observable<IObject>;
   readonly joinRequest$: Observable<ServerNetworkMessage<JoinRequest>>;

   constructor(@Inject private readonly wrapper: ServerNetworkWrapper) {
      this.clientConnectedId$ = wrapper.clientConnectedId$;
      this.clientDisconnectedId$ = wrapper.clientDisconnectedId$;
      this.event$ = wrapper.clientEvent$;
      this.dataStore$ = this.onEvent(NetworkEvent.DATA_STORE) as Observable<IObject>;
      this.joinRequest$ = this.onMessage(NetworkEvent.JOIN_REQUEST) as Observable<ServerNetworkMessage<JoinRequest>>;
   }

   private onEvent(event: NetworkEvent): Observable<IObject> {
      return this.onMessage(event).pipe(map((message) => message.value));
   }

   private onMessage(event: NetworkEvent): Observable<ServerNetworkMessage> {
      return this.event$.pipe(filter((message) => message.event === event));
   }

   sendLoginResponse(user: string, response: JoinResponse): void {
      this.wrapper.send(user, { event: NetworkEvent.JOIN_RESPONSE, value: response });
   }

   sendDataStore(users: string[], storeId: string, id: string, value: IObject): void {
      const data = Utils.keyValueObject(storeId, Utils.keyValueObject(id, value));
      users.forEach((user) => this.wrapper.send(user, { event: NetworkEvent.DATA_STORE, value: data }));
   }
}
