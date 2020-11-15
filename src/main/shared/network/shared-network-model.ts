import { IObject } from '../util/util-model';

export enum NetworkEvent {
   // PlayerCharacter data, chat messages, bullets game status and maybe plane data also should be sent using StoreService automatically.
   // We can send other data, though, adding new event like PING or something else as needed but trying to be generic.
   DATA_STORE,
   JOIN_REQUEST,
   JOIN_RESPONSE,
}

export interface NetworkMessage<T extends IObject = IObject> {
   event: NetworkEvent;
   value: T;
}

//

export interface JoinRequest extends IObject {
   userName: string;
}

export interface JoinResponse extends IObject {
   userId: string;
   map: {
      buffer: Buffer;
      size: number;
   };
   // TODO: roomId: string;
}
