import { CommonClientConfig } from './common-client-config';

interface ServerConfig {
   readonly url: string;
   readonly name: string;
}

// Import this class for config properties, though, you should define here only development properties
export class ClientConfig extends CommonClientConfig {
   static readonly ASSET_FOLDER: string = '../../src/asset/';
   static readonly AUTO_START: boolean = false; // Skip main menu for development purposes
   static readonly SERVER_HOSTS: ServerConfig[] = [
      {
         url: `http://localhost:${ClientConfig.SERVER_PORT}`,
         name: 'Europe West',
      },
      {
         url: `http://localhost:${ClientConfig.SERVER_PORT}`,
         name: 'North America',
      },
   ];
}
