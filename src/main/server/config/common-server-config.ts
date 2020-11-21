import { SharedConfig } from '../../shared/config/shared-config';

export class CommonServerConfig extends SharedConfig {
   static readonly MOON_RADIUS: number = 400 * CommonServerConfig.MAP_OUTPUT_SCALE;
   static readonly MAX_NR_OF_PLAYERS: number = 20;
   static readonly TICK_RATE: number = CommonServerConfig.NETWORK_TICK_RATE;
   static readonly BULLET_SPEED: number = CommonServerConfig.BULLET_BASE_SPEED / CommonServerConfig.TICK_RATE;
}
