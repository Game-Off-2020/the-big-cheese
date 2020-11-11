import { Inject, Singleton } from 'typescript-ioc';
import { BufferedNetworkComponent } from './buffered-network-component';
import { Observable } from 'rxjs';
import { NetworkEvent, NetworkMessage } from './network-model';
import { IObject } from '../../shared/util/util-model';
import { filter, flatMap, map } from 'rxjs/internal/operators';

@Singleton
export class NetworkComponent {
   readonly connected$: Observable<void>;
   readonly disconnected$: Observable<void>;
   readonly event$: Observable<NetworkMessage>;

   constructor(@Inject private readonly bufferedNetwork: BufferedNetworkComponent) {
      this.connected$ = bufferedNetwork.connected$;
      this.disconnected$ = bufferedNetwork.disconnected$;
      this.event$ = bufferedNetwork.data$.pipe(flatMap((x) => x));
   }

   onEvent(event: NetworkEvent): Observable<IObject> {
      return this.event$.pipe(
         filter((message) => message.event === event),
         map((message) => message.value),
      );
   }

   send(event: NetworkEvent, value: IObject): void {
      this.bufferedNetwork.send(event, value);
   }
}
