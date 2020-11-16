import { Inject, Singleton } from 'typescript-ioc';
import { ServerSocketIoWrapper } from './server-socket-io-wrapper';
import { MsgpackJsonEncoder } from '../../shared/network/msgpack-json-encoder';
import { Socket } from 'socket.io';
import { fromEvent, Subject } from 'rxjs';
import { ServerNetworkMessage } from './server-network-model';
import { flatMap, map } from 'rxjs/internal/operators';
import { NetworkMessage } from '../../shared/network/shared-network-model';

@Singleton
export class ServerNetworkWrapper {
   private readonly clients = new Map<string, Socket>();

   private readonly clientEventSubject = new Subject<ServerNetworkMessage>();
   readonly clientEvent$ = this.clientEventSubject.asObservable();
   private readonly clientConnectedIdSubject = new Subject<string>();
   readonly clientConnectedId$ = this.clientConnectedIdSubject.asObservable();
   private readonly clientDisconnectedIdSubject = new Subject<string>();
   readonly clientDisconnectedId$ = this.clientDisconnectedIdSubject.asObservable();

   constructor(
      @Inject private readonly wrapper: ServerSocketIoWrapper,
      @Inject private readonly jsonEncoder: MsgpackJsonEncoder,
   ) {
      wrapper.connected$.subscribe((client) => this.initClient(client));
   }

   send(clientId: string, message: NetworkMessage): void {
      const client = this.clients.get(clientId);
      if (client) {
         client.emit(ServerSocketIoWrapper.EVENT_DATA, this.jsonEncoder.encode(message));
      }
   }

   private initClient(client: Socket): void {
      this.clients.set(client.id, client);
      this.subscribeClientEvent(client);
      this.subscribeClientDisconnect(client);
      this.clientConnectedIdSubject.next(client.id);
   }

   private subscribeClientEvent(client: Socket): void {
      fromEvent(client, ServerSocketIoWrapper.EVENT_DATA)
         .pipe(
            map((buffer: Buffer) => this.jsonEncoder.decode(buffer) as NetworkMessage[]),
            flatMap((x) => x),
            map(
               (message) =>
                  ({
                     user: client.id,
                     ...message,
                  } as ServerNetworkMessage),
            ),
         )
         .subscribe((message) => this.clientEventSubject.next(message));
   }

   private subscribeClientDisconnect(client: Socket): void {
      fromEvent(client, ServerSocketIoWrapper.EVENT_DISCONNECTED).subscribe(() => {
         this.clients.delete(client.id);
         this.clientDisconnectedIdSubject.next(client.id);
      });
   }
}
