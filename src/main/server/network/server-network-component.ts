import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkWrapper } from './server-network-wrapper';
import { Observable } from 'rxjs';
import { ServerNetworkMessage } from './server-network-model';
import { LoginResponse, NetworkEvent } from '../../shared/network/shared-network-model';
import { IObject } from '../../shared/util/util-model';
import { filter, map } from 'rxjs/internal/operators';
import { Utils } from '../../shared/util/utils';

@Singleton
export class ServerNetworkComponent {
   readonly clientConnectedId$: Observable<string>;
   private event$: Observable<ServerNetworkMessage>;
   readonly dataStore$: Observable<IObject>;

   constructor(@Inject private readonly wrapper: ServerNetworkWrapper) {
      this.clientConnectedId$ = wrapper.clientConnectedId$;
      this.event$ = wrapper.clientEvent$;
      this.dataStore$ = this.onEvent(NetworkEvent.DATA_STORE) as Observable<IObject>;
   }

   private onEvent(event: NetworkEvent): Observable<IObject> {
      return this.event$.pipe(
         filter((message) => message.event === event),
         map((message) => message.value),
      );
   }

   sendLoginResponse(user: string, response: LoginResponse): void {
      this.wrapper.send(user, { event: NetworkEvent.LOGIN_RESPONSE, value: response });
   }

   sendDataStore(users: string[], storeId: string, id: string, value: IObject): void {
      const data = Utils.keyValueObject(storeId, Utils.keyValueObject(id, value));
      users.forEach((user) => this.wrapper.send(user, { event: NetworkEvent.DATA_STORE, value: data }));
   }
}
