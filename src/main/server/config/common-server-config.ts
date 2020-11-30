import { SharedConfig } from '../../shared/config/shared-config';

export class CommonServerConfig extends SharedConfig {
   static readonly MOON_RADIUS: number = 600 * CommonServerConfig.MAP_OUTPUT_SCALE;
   static readonly TICK_RATE: number = CommonServerConfig.NETWORK_TICK_RATE;
   static readonly BULLET_SPEED: number = CommonServerConfig.BULLET_BASE_SPEED / CommonServerConfig.TICK_RATE;
   static readonly DROP_CHEESE_PERCENTAGE: number = 0.08;
   static readonly MAX_DROP_CHEESE: number = 10;
   static readonly CHEESE_BOMB_COUNT: number = 15;
   static readonly BULLET_BLAST_RADIUS_MIN: number = 50;
   static readonly BULLET_BLAST_RADIUS_MAX: number = 60;
}
