import { Singleton } from 'typescript-ioc';
import { NetworkEvent, NetworkMessage, NetworkMessageValue } from './network-model';
import { SharedConfig } from '../../shared/config/shared-config';
import deepmerge from 'deepmerge';

@Singleton
export class BufferedNetworkComponent {
   private readonly bufferTimerMs = 1000 / SharedConfig.NETWORK_TICK_RATE;
   private bufferedEventsMessages = new Map<NetworkEvent, any>();
   private lastSendTime: number = 0;
   private readonly bindRequestBufferTimer;
   private sending = false;

   constructor() {
      this.bindRequestBufferTimer = this.requestBufferTimer.bind(this);
      /*(async () => {
         this.network = <INetwork><unknown>(await spawn(new Worker("./client-network")));
         this.network.messageEvent().subscribe(message => this.onMessage(message));
         this.network.connectedEvent().subscribe(() => this._connectedEvent.trigger());
         this.network.connectionLostEvent().subscribe(() => this._connectionLostEvent.trigger());
         this.network.init();
         this.requestBufferTimer();
      })();

       */
      this.requestBufferTimer();
   }

   send(event: NetworkEvent, value: NetworkMessageValue): void {
      const mergedMessage = deepmerge.all([this.getEventMessage(event), value]);
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
      //if (this.network && await this.network.isReady()) {
      const messages = this.getBufferedEventMessages();
      this.bufferedEventsMessages.clear();
      this.lastSendTime = Date.now();
      console.log('Client sending messages:', messages);
      //messages.forEach(async (message) => await this.network.send(message));
      //} else {
      //   console.log("Cannot send network message, connection is not ready yet.");
      //}
      this.sending = false;
   }

   private getBufferedEventMessages(): NetworkMessage[] {
      return Array.from(this.bufferedEventsMessages.entries())
         .filter((entry) => Object.keys(entry).length)
         .map(([event, value]) => ({ event, value }));
   }

   private getEventMessage(event: NetworkEvent): any {
      if (!this.bufferedEventsMessages.has(event)) {
         this.bufferedEventsMessages.set(event, {});
      }
      return this.bufferedEventsMessages.get(event);
   }

   //private onMessage(message: NetworkMessage) {
   //   if (this.callbackNetworkEvents.has(message.eventId)) {
   //       this.callbackNetworkEvents.get(message.eventId).trigger(message.value);
   //    }
   // }
}
