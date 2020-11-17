import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkWrapper } from './server-network-wrapper';
import { Observable } from 'rxjs';
import { ServerNetworkMessage } from './server-network-model';
import { JoinRequest, JoinResponse, NetworkEvent, ShootRequest } from '../../shared/network/shared-network-model';
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
   readonly shootRequest$: Observable<ServerNetworkMessage<ShootRequest>>;

   constructor(@Inject private readonly wrapper: ServerNetworkWrapper) {
      this.clientConnectedId$ = wrapper.clientConnectedId$;
      this.clientDisconnectedId$ = wrapper.clientDisconnectedId$;
      this.event$ = wrapper.clientEvent$;
      this.dataStore$ = this.onEvent(NetworkEvent.DATA_STORE) as Observable<IObject>;
      this.joinRequest$ = this.onMessage<JoinRequest>(NetworkEvent.JOIN_REQUEST);
      this.shootRequest$ = this.onMessage<ShootRequest>(NetworkEvent.SHOOT_REQUEST);
   }

   private onEvent(event: NetworkEvent): Observable<IObject> {
      return this.onMessage(event).pipe(map((message) => message.value));
   }

   private onMessage<T = IObject>(event: NetworkEvent): Observable<ServerNetworkMessage<T>> {
      return this.event$.pipe(
         filter((message) => message.event === event),
         map((message) => (message as unknown) as ServerNetworkMessage<T>),
      );
   }

   sendLoginResponse(user: string, response: JoinResponse): void {
      this.wrapper.send(user, { event: NetworkEvent.JOIN_RESPONSE, value: response });
   }

   sendDataStore(users: string[], storeId: string, id: string, value: IObject): void {
      const data = Utils.keyValueObject(storeId, Utils.keyValueObject(id, value));
      users.forEach((user) => this.wrapper.send(user, { event: NetworkEvent.DATA_STORE, value: data }));
   }
}
