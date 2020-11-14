import { IObject } from '../util/util-model';

export enum NetworkEvent {
   // Player data, chat messages, bullets game status and maybe plane data also should be sent using StoreService automatically.
   // We can send other data, though, adding new event like PING or something else as needed but trying to be generic.
   DATA_STORE,
   LOGIN_RESPONSE,
}

export interface NetworkMessage {
   event: NetworkEvent;
   value: IObject;
}

//

export interface LoginResponse extends IObject {
   id: string;
   map: {
      buffer: Buffer;
      size: number;
   };
}
