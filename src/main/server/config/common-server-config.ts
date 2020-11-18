import { SharedConfig } from '../../shared/config/shared-config';

export class CommonServerConfig {
   static readonly TICK_RATE: number = SharedConfig.NETWORK_TICK_RATE;
   static readonly BULLET_SPEED: number = SharedConfig.BULLET_BASE_SPEED / CommonServerConfig.TICK_RATE;
   static readonly BULLET_MAX_AGE_MS: number = 3000;
}
