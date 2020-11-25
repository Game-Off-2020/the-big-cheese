import { SharedConfig } from '../../shared/config/shared-config';

interface ServerHost {
   readonly url: string;
   readonly name: string;
}

// Set production (or for both production and development) properties here,
// but import them via ServerConfig
export class CommonClientConfig extends SharedConfig {
   static readonly ASSET_FOLDER: string = 'asset/';
   static readonly AUTO_START: boolean = false;
   static readonly SHOOT_INTERVAL: number = 200; // After every x ms
   static readonly INTERPOLATION_SIZE: number = 3;
   static readonly TIME_BETWEEN_TWO_JUMP_MS: number = 500;
   static readonly SERVER_HOSTS: ServerHost[] = [
      {
         url: `http://localhost:${CommonClientConfig.SERVER_SOCKET_PORT}`,
         name: 'Europe West',
      },
      {
         url: `http://localhost:${CommonClientConfig.SERVER_SOCKET_PORT}`,
         name: 'North America',
      },
   ];
}
