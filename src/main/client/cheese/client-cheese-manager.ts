import { Inject, Singleton } from 'typescript-ioc';
import { ClientCheeseComponent } from './client-cheese-component';

@Singleton
export class ClientCheeseManager {
   constructor(@Inject private readonly component: ClientCheeseComponent) {}
}
