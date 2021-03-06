import { Inject, Singleton } from 'typescript-ioc';
import { ClientBufferedNetworkComponent } from './client-buffered-network-component';
import { Observable } from 'rxjs';
import {
   JoinRequest,
   JoinResponse,
   JoinResponseStatus,
   MapUpdateResponse,
   NetworkEvent,
   NetworkMessage,
} from '../../shared/network/shared-network-model';
import { filter, map } from 'rxjs/internal/operators';
import { Utils } from '../../shared/util/utils';
import { BulletFireOptions } from '../bullet/default-bullet';
import { AllStores } from '../../shared/models/all-stores';

@Singleton
export class ClientNetworkComponent {
   readonly connected$: Observable<void>;
   readonly disconnected$: Observable<void>;
   private event$: Observable<NetworkMessage>;
   private readonly joinResponse$: Observable<JoinResponse>;
   readonly joined$: Observable<JoinResponse>;
   readonly joinFailed$: Observable<JoinResponseStatus>;
   readonly dataStore$: Observable<{ [key: string]: AllStores }>;
   readonly mapUpdate$: Observable<MapUpdateResponse>;

   constructor(@Inject private readonly bufferedNetwork: ClientBufferedNetworkComponent) {
      this.connected$ = bufferedNetwork.connected$;
      this.disconnected$ = bufferedNetwork.disconnected$;
      this.event$ = bufferedNetwork.data$;
      this.joinResponse$ = this.onEvent<JoinResponse>(NetworkEvent.JOIN_RESPONSE);
      this.joined$ = this.joinResponse$.pipe(filter((response) => response.status === JoinResponseStatus.JOINED));
      this.joinFailed$ = this.joinResponse$.pipe(
         filter((response) => response.status !== JoinResponseStatus.JOINED),
         map((response) => response.status),
      );
      this.dataStore$ = this.onEvent<{ [key: string]: AllStores }>(NetworkEvent.DATA_STORE);
      this.mapUpdate$ = this.onEvent<MapUpdateResponse>(NetworkEvent.MAP_UPDATE);
   }

   private onEvent<T>(event: NetworkEvent): Observable<T> {
      return this.event$.pipe(
         filter((message) => message.event === event),
         map((message) => (message.value as unknown) as T),
      );
   }

   connect(host: string): void {
      this.bufferedNetwork.connect(host);
   }

   sendDataStore<T>(storeId: string, id: string, value: T): void {
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
