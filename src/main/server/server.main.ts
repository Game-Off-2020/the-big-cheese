import { Container, Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkManager } from './network/server-network-manager';

@Singleton
export class ServerMain {
   constructor(@Inject private readonly network: ServerNetworkManager) {}
}

Container.get(ServerMain);

setInterval(() => {
   // Keep running
}, 100000);
