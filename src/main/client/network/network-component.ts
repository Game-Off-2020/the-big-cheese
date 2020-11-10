import { Inject, Singleton } from 'typescript-ioc';
import { BufferedNetworkComponent } from './buffered-network-component';

@Singleton
export class NetworkComponent {
   constructor(@Inject private readonly bufferedComponent: BufferedNetworkComponent) {}

   // TODO: Init and receive Sync objects
}
