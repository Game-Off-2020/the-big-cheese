import { ClientConfig } from '../../config/client-config';
import { fromEvent, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SharedSocketIoWrapper } from '../../../shared/network/shared-socket-io-wrapper';

export class ClientSocketIoWrapper<T> extends SharedSocketIoWrapper {
   readonly connected$: Observable<void>;
   readonly disconnected$: Observable<void>;
   readonly data$: Observable<T>;

   private readonly socket: Socket;

   constructor() {
      super();
      this.socket = io(ClientConfig.SERVER_HOST);
      this.connected$ = fromEvent(this.socket, ClientSocketIoWrapper.EVENT_CONNECTED);
      this.disconnected$ = fromEvent(this.socket, ClientSocketIoWrapper.EVENT_DISCONNECTED);
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
