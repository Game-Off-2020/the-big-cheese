import { SharedConfig } from '../../shared/config/shared-config';

export interface ServerHost {
   readonly url: string;
   readonly name: string;
}

// Set production (or for both production and development) properties here,
// but import them via ServerConfig
export class CommonClientConfig extends SharedConfig {
   static readonly ASSET_FOLDER: string = 'asset/';
   static readonly AUTO_START: boolean = false;
   static readonly INTERPOLATION_SIZE: number = 3;
   static readonly TIME_BETWEEN_TWO_JUMP_MS: number = 500;
   static readonly TIME_BETWEEN_TWO_SHOOTS_MS: number = 200;
   static readonly AMMO_RESTORE_PER_S: number = 2.2;
   static readonly MAX_AMMO: number = 10;
   static readonly SCOREBOARD_SIZE: number = 5;
   static readonly MAX_PLAYER_NAME_LENGTH: number = 10;
   static readonly PLAYER_SPRITE_HEIGHT: number = 48;
   static readonly SERVER_HOSTS: ServerHost[] = [
      {
         url: `https://the-big-cheese-eu.herokuapp.com`,
         name: 'Europe',
      },
      {
         url: `https://the-big-cheese-us.herokuapp.com`,
         name: 'North America',
      },
   ];
}
