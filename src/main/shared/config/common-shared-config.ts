export class CommonSharedConfig {
   static readonly NETWORK_TICK_RATE: number = 8; // Max data sync per sec
   static readonly SERVER_PORT: number = 3001;
   static readonly BULLET_BASE_SPEED: number = (50 * 1000) / 60;
   static readonly MAP_OUTPUT_SCALE: number = 6; // The real canvas will be this time smaller than what we see
}
