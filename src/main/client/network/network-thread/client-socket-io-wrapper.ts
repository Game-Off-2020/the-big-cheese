import { fromEvent, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SharedSocketIoWrapper } from '../../../shared/network/shared-socket-io-wrapper';
import { tap } from 'rxjs/operators';

export class ClientSocketIoWrapper<T> extends SharedSocketIoWrapper {
   private readonly connectedSubject = new Subject<void>();
   readonly connected$ = this.connectedSubject.asObservable();
   private readonly disconnectedSubject = new Subject<void>();
   readonly disconnected$ = this.disconnectedSubject.asObservable();
   private readonly dataSubject = new Subject<T>();
   readonly data$ = this.dataSubject.asObservable();

   private socket?: Socket;

   connect(host: string): void {
      if (this.socket) {
         this.socket.disconnect();
      }
      this.socket = io(host, { autoConnect: false });
      fromEvent(this.socket, ClientSocketIoWrapper.EVENT_CONNECTED)
         .pipe(tap(() => console.log('Network connected')))
         .subscribe(() => this.connectedSubject.next());
      fromEvent(this.socket, ClientSocketIoWrapper.EVENT_DISCONNECTED)
         .pipe(tap(() => console.log('Network disconnected')))
         .subscribe(() => this.disconnectedSubject.next());
      fromEvent(this.socket, ClientSocketIoWrapper.EVENT_DATA).subscribe((data: T) => this.dataSubject.next(data));
      this.socket.connect();
   }

   isConnected(): boolean {
      return this.socket.connected;
   }

   send(data: T): void {
      this.socket.emit(ClientSocketIoWrapper.EVENT_DATA, data);
   }
}
