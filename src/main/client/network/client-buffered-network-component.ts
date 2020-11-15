import { Singleton } from 'typescript-ioc';
import { NetworkEvent, NetworkMessage } from '../../shared/network/shared-network-model';
import { SharedConfig } from '../../shared/config/shared-config';
import deepmerge from 'deepmerge';
import { IObject } from '../../shared/util/util-model';
import { spawn, Worker } from 'threads/dist';
import { ClientNetworkThread } from './network-thread/client-network-thread';
import 'threads/register';
import { Subject } from 'rxjs';

@Singleton
export class ClientBufferedNetworkComponent {
   private readonly bufferTimerMs = 1000 / SharedConfig.NETWORK_TICK_RATE;
   private bufferedEventsMessages = new Map<NetworkEvent, IObject>();
   private lastSendTime = 0;
   private readonly bindRequestBufferTimer;
   private sending = false;
   private networkThread?: ClientNetworkThread;

   private readonly connectedSubject = new Subject<void>();
   readonly connected$ = this.connectedSubject.pipe();
   private readonly disconnectedSubject = new Subject<void>();
   readonly disconnected$ = this.disconnectedSubject.pipe();
   private readonly dataSubject = new Subject<NetworkMessage>();
   readonly data$ = this.dataSubject.pipe();

   constructor() {
      this.bindRequestBufferTimer = this.requestBufferTimer.bind(this);
      this.initNetworkThread();
   }

   private async initNetworkThread(): Promise<void> {
      this.networkThread = ((await spawn(
         new Worker('./network-thread/client-network-thread', { type: 'module' }),
      )) as unknown) as ClientNetworkThread;
      this.networkThread.onConnected().subscribe(() => this.connectedSubject.next());
      this.networkThread.onDisconnected().subscribe(() => this.disconnectedSubject.next());
      this.networkThread.onData().subscribe((data) => this.dataSubject.next(data));
      this.requestBufferTimer();
   }

   connect(): void {
      if (!this.networkThread) {
         return console.warn('Cannot connect, network thread is not ready yet!');
      }
      this.networkThread.connect();
   }

   send(event: NetworkEvent, value: IObject): void {
      const mergedMessage = deepmerge.all([this.getEventMessage(event), value]) as IObject;
      this.bufferedEventsMessages.set(event, mergedMessage);
      this.sendBufferedEventMessagesInTime();
   }

   private requestBufferTimer(): void {
      this.sendBufferedEventMessagesInTime();
      requestAnimationFrame(this.bindRequestBufferTimer);
   }

   protected sendBufferedEventMessagesInTime(): void {
      if (!this.sending && Date.now() > this.lastSendTime + this.bufferTimerMs) {
         this.sendBufferedEvents();
      }
   }

   private async sendBufferedEvents(): Promise<void> {
      if (this.bufferedEventsMessages.size === 0) {
         return null;
      }
      this.sending = true;
      this.lastSendTime = Date.now();
      if (this.networkThread && (await this.networkThread.isReady())) {
         const messages = this.getBufferedEventMessages();
         this.bufferedEventsMessages.clear();
         await this.networkThread.send(messages);
      } else {
         console.log('Cannot send network message, connection is not ready yet.');
      }
      this.sending = false;
   }

   private getBufferedEventMessages(): NetworkMessage[] {
      return Array.from(this.bufferedEventsMessages.entries())
         .filter((entry) => Object.keys(entry).length)
         .map(([event, value]) => ({ event, value }));
   }

   private getEventMessage(event: NetworkEvent): IObject {
      return this.bufferedEventsMessages.get(event) ?? {};
   }
}
