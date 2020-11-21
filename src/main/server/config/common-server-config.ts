import { SharedConfig } from '../../shared/config/shared-config';
import { ServerConfig } from './server-config';

export class CommonServerConfig extends SharedConfig {
   static readonly TICK_RATE: number = ServerConfig.NETWORK_TICK_RATE;
   static readonly BULLET_SPEED: number = ServerConfig.BULLET_BASE_SPEED / CommonServerConfig.TICK_RATE;
}
