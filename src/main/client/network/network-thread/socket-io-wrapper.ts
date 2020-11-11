import * as SocketIO from 'socket.io-client';
import { ClientConfig } from '../../config/client-config';
import { fromEvent, Observable } from 'rxjs';

export class SocketIoWrapper {
   private static readonly EVENT_CONNECTED = 'connect';
   private static readonly EVENT_DISCONNECTED = 'disconnect';
   private static readonly EVENT_DATA = 'event';
   private readonly socket: SocketIO.Socket;

   readonly connected$: Observable<void>;
   readonly disconnected$: Observable<void>;
   readonly data$: Observable<unknown>;

   constructor() {
      this.socket = SocketIO.io(ClientConfig.SERVER_HOST);
      this.connected$ = fromEvent(this.socket, SocketIoWrapper.EVENT_CONNECTED);
      this.disconnected$ = fromEvent(this.socket, SocketIoWrapper.EVENT_DISCONNECTED);
      this.data$ = fromEvent(this.socket, SocketIoWrapper.EVENT_DATA);
      this.socket.connect();
   }

   isConnected(): boolean {
      return this.socket.connected;
   }

   send(data: unknown): void {
      this.socket.emit(SocketIoWrapper.EVENT_DATA, data);
   }
}
