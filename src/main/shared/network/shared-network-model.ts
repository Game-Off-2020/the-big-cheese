import { Bullet } from '../bullet/bullet-model';
import { Player } from '../player/player-model';

export enum NetworkEvent {
   // PlayerCharacter data, chat messages, bullets game status and maybe plane data also should be sent using StoreService automatically.
   // We can send other data, though, adding new event like PING or something else as needed but trying to be generic.
   DATA_STORE,
   JOIN_REQUEST,
   JOIN_RESPONSE,
   SHOOT_REQUEST,
   MAP_UPDATE,
}

export interface NetworkMessage<T = NetworkPayload> {
   event: NetworkEvent;
   value: T;
}

export interface JoinRequest {
   userName: string;
   host: string;
}

export enum JoinResponseStatus {
   JOINED,
   SERVER_FULL,
}

export interface JoinResponse {
   status: JoinResponseStatus;
   map?: {
      buffer: Buffer;
      size: number;
   };
   player?: Player;
}

export interface MapUpdateResponse {
   buffer: Buffer;
}

export type ShootRequest = Bullet;

// {} should not be used. {} seems to have semantic meaning, a "NOOP" or "NO_DATA" of sorts? Probably best to use a NOOP constant instead.
// eslint-disable-next-line @typescript-eslint/ban-types
export type NetworkPayload = JoinRequest | JoinResponse | ShootRequest | {};
