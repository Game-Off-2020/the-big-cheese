// Set production (or for both production and development) properties here,
// but import them via ServerConfig
import { SharedConfig } from '../../shared/config/shared-config';

export class CommonClientConfig {
   static readonly ASSET_FOLDER: string = 'asset/';
   static readonly AUTO_START: boolean = false;
   static readonly SERVER_HOST: string = `https://game-off.glitch.me:${SharedConfig.SERVER_PORT}`;
   static readonly SHOOT_INTERVAL: number = 200; // After every x ms
}
