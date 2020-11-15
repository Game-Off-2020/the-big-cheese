import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkComponent } from '../network/server-network-component';
import { ServerBulletComponent } from './server-bullet-component';

@Singleton
export class ServerBulletManager {
   constructor(
      @Inject private readonly component: ServerBulletComponent,
      @Inject private readonly network: ServerNetworkComponent,
   ) {
      network.shootRequest$.subscribe((message) => component.shoot(message.user));
   }
}
