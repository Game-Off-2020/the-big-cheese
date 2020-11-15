import { expose } from 'threads/worker';
import { Container, Inject, Singleton } from 'typescript-ioc';
import { MsgpackJsonEncoder } from '../../../shared/network/msgpack-json-encoder';
import { NetworkMessage } from '../../../shared/network/shared-network-model';
import { ClientSocketIoWrapper } from './client-socket-io-wrapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Singleton
export class ClientNetworkThread {
   constructor(
      @Inject private readonly wrapper: ClientSocketIoWrapper<Buffer>,
      @Inject private readonly jsonEncoder: MsgpackJsonEncoder,
   ) {}

   onConnected(): Observable<void> {
      return this.wrapper.connected$;
   }

   onDisconnected(): Observable<void> {
      return this.wrapper.disconnected$;
   }

   onData(): Observable<NetworkMessage> {
      return this.wrapper.data$.pipe(map((buffer) => this.jsonEncoder.decode(buffer) as NetworkMessage));
   }

   connect(): void {
      this.wrapper.connect();
   }

   isReady(): boolean {
      return this.wrapper.isConnected();
   }

   send(messages: NetworkMessage[]): void {
      this.wrapper.send(this.jsonEncoder.encode(messages));
   }
}

const thread = Container.get(ClientNetworkThread);

expose({
   onConnected: thread.onConnected.bind(thread),
   onDisconnected: thread.onDisconnected.bind(thread),
   onData: thread.onData.bind(thread),
   connect: thread.connect.bind(thread),
   isReady: thread.isReady.bind(thread),
   send: thread.send.bind(thread),
});
