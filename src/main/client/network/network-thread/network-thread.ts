import { expose } from 'threads/worker';
import { Container, Inject, Singleton } from 'typescript-ioc';
import { MsgpackJsonEncoder } from '../../../shared/network/msgpack-json-encoder';
import { NetworkMessage } from '../network-model';
import { SocketIoWrapper } from './socket-io-wrapper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Singleton
export class NetworkThread {
   constructor(
      @Inject private readonly wrapper: SocketIoWrapper<Buffer>,
      @Inject private readonly jsonEncoder: MsgpackJsonEncoder,
   ) {}

   onConnected(): Observable<void> {
      return this.wrapper.connected$;
   }

   onDisconnected(): Observable<void> {
      return this.wrapper.disconnected$;
   }

   onData(): Observable<NetworkMessage[]> {
      return this.wrapper.data$.pipe(map((buffer) => this.jsonEncoder.decode(buffer) as NetworkMessage[]));
   }

   isReady(): boolean {
      return this.wrapper.isConnected();
   }

   send(messages: NetworkMessage[]): void {
      this.wrapper.send(this.jsonEncoder.encode(messages));
   }
}

const thread = Container.get(NetworkThread);

expose({
   onConnected: thread.onConnected.bind(thread),
   onDisconnected: thread.onDisconnected.bind(thread),
   onData: thread.onData.bind(thread),
   isReady: thread.isReady.bind(thread),
   send: thread.send.bind(thread),
});
