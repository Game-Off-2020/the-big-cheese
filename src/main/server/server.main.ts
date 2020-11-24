import { Container, Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkManager } from './network/server-network-manager';
import { ServerPlayerManager } from './player/server-player-manager';
import { ServerMapManager } from './map/server-map-manager';
import { ServerBulletManager } from './bullet/server-bullet-manager';
import { ServerStatusComponent } from './status/server-status-component';
import { ServerCheeseManager } from './cheese/server-cheese-manager';

@Singleton
export class ServerMain {
   constructor(
      @Inject private readonly network: ServerNetworkManager,
      @Inject private readonly player: ServerPlayerManager,
      @Inject private readonly map: ServerMapManager,
      @Inject private readonly bullet: ServerBulletManager,
      @Inject private readonly cheese: ServerCheeseManager,
      @Inject private readonly status: ServerStatusComponent,
   ) {}
}

Container.get(ServerMain);

setInterval(() => {
   // Keep running
}, 100000);
