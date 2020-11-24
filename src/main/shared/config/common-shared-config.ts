export class CommonSharedConfig {
   static readonly NETWORK_TICK_RATE: number = 15; // Max data sync per sec
   static readonly SERVER_SOCKET_PORT: number = 3001;
   static readonly SERVER_API_PORT: number = 3002;
   static readonly MAP_OUTPUT_SCALE: number = 4; // The real canvas will be this time smaller than what we see
   static readonly BULLET_BASE_SPEED: number = (70 * 1000) / 60 / CommonSharedConfig.MAP_OUTPUT_SCALE;
   static readonly BULLET_MAX_AGE_MS: number = 3000;
   static readonly PLAYER_WIDTH: number = 10;
   static readonly PLAYER_HEIGHT: number = 20;
   static readonly RANDOM_START_POSITION: boolean = true;
}
