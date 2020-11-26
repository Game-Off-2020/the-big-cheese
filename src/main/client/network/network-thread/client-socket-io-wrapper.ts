import { ClientConfig } from '../../config/client-config';
import { fromEvent, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SharedSocketIoWrapper } from '../../../shared/network/shared-socket-io-wrapper';
import { tap } from 'rxjs/operators';

export class ClientSocketIoWrapper<T> extends SharedSocketIoWrapper {
   readonly connected$: Observable<void>;
   readonly disconnected$: Observable<void>;
   readonly data$: Observable<T>;

   private readonly socket: Socket;

   constructor() {
      super();
      this.socket = io(ClientConfig.SERVER_HOSTS[0].url, { autoConnect: false });
      this.connected$ = fromEvent(this.socket, ClientSocketIoWrapper.EVENT_CONNECTED).pipe(
         tap(() => console.log('Network connected')),
      ) as Observable<void>;
      this.disconnected$ = fromEvent(this.socket, ClientSocketIoWrapper.EVENT_DISCONNECTED).pipe(
         tap(() => console.log('Network disconnected')),
      ) as Observable<void>;
      this.data$ = fromEvent(this.socket, ClientSocketIoWrapper.EVENT_DATA);
   }

   connect(): void {
      this.socket.connect();
   }

   isConnected(): boolean {
      return this.socket.connected;
   }

   send(data: T): void {
      this.socket.emit(ClientSocketIoWrapper.EVENT_DATA, data);
   }
}
