import { Singleton } from 'typescript-ioc';
import { interval } from 'rxjs';
import { ServerConfig } from '../config/server-config';

@Singleton
export class ServerTimerComponent {
   readonly tick$ = interval(1000 / ServerConfig.TICK_RATE);
}
