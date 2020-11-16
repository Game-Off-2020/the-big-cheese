import { Inject, Singleton } from 'typescript-ioc';
import { ClientBufferedNetworkComponent } from './client-buffered-network-component';
import { Observable } from 'rxjs';
import { JoinRequest, JoinResponse, NetworkEvent, NetworkMessage } from '../../shared/network/shared-network-model';
import { IObject } from '../../shared/util/util-model';
import { filter, map, tap } from 'rxjs/internal/operators';
import { Utils } from '../../shared/util/utils';
import { BulletFireOptions } from '../scene/default-bullet';

@Singleton
export class ClientNetworkComponent {
   readonly connected$: Observable<void>;
   readonly disconnected$: Observable<void>;
   private event$: Observable<NetworkMessage>;
   readonly loginResponse$: Observable<JoinResponse>;
   readonly dataStore$: Observable<IObject>;

   constructor(@Inject private readonly bufferedNetwork: ClientBufferedNetworkComponent) {
      this.connected$ = bufferedNetwork.connected$;
      this.disconnected$ = bufferedNetwork.disconnected$;
      this.event$ = bufferedNetwork.data$;
      this.loginResponse$ = this.onEvent<JoinResponse>(NetworkEvent.JOIN_RESPONSE);
      this.dataStore$ = this.onEvent(NetworkEvent.DATA_STORE);
   }

   private onEvent<T = IObject>(event: NetworkEvent): Observable<T> {
      return this.event$.pipe(
         tap((message) => console.log(message)),
         filter((message) => message.event === event),
         map((message) => message.value as unknown as T),
      );
   }

   connect(): void {
      this.bufferedNetwork.connect();
   }

   sendDataStore(storeId: string, id: string, value: IObject): void {
      const data = Utils.keyValueObject(storeId, Utils.keyValueObject(id, value));
      this.bufferedNetwork.send(NetworkEvent.DATA_STORE, data);
   }

   sendJoinRequest(request: JoinRequest): void {
      this.bufferedNetwork.send(NetworkEvent.JOIN_REQUEST, request);
   }

   sendShootRequest(options: BulletFireOptions): void {
      this.bufferedNetwork.send<BulletFireOptions>(NetworkEvent.SHOOT_REQUEST, options);
   }
}
