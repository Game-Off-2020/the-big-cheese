export enum NetworkEvent {
   SYNC_OBJECT,
}

export interface NetworkMessage {
   event: NetworkEvent;
   value: NetworkMessageValue;
}

export interface NetworkMessageValue {}
