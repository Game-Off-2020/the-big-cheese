import { CommonClientConfig } from './common-client-config';

// Import this class for config properties, though, you should define here only development properties
export class ClientConfig extends CommonClientConfig {
   static readonly ASSET_FOLDER: string = '../../src/asset/';
   static readonly AUTO_START: boolean = false; // Skip main menu for development purposes
}
