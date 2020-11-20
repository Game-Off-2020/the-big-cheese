import { Bullet } from '../bullet/bullet-model';

export enum NetworkEvent {
   // PlayerCharacter data, chat messages, bullets game status and maybe plane data also should be sent using StoreService automatically.
   // We can send other data, though, adding new event like PING or something else as needed but trying to be generic.
   DATA_STORE,
   JOIN_REQUEST,
   JOIN_RESPONSE,
   SHOOT_REQUEST,
}

export interface NetworkMessage<T = NetworkPayload> {
   event: NetworkEvent;
   value: T;
}

export interface JoinRequest {
   userName: string;
}

export enum JoinResponseStatus {
   JOINED,
   SERVER_FULL,
}

export interface JoinResponse {
   status: JoinResponseStatus;
   userId?: string;
   map?: {
      buffer: Buffer;
      size: number;
   };
}

export type ShootRequest = Bullet;

// {} should not be used. {} seems to have semantic meaning, a "NOOP" or "NO_DATA" of sorts? Probably best to use a NOOP constant instead.
// eslint-disable-next-line @typescript-eslint/ban-types
export type NetworkPayload = JoinRequest | JoinResponse | ShootRequest | {};
