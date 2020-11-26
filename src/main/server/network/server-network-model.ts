import { NetworkMessage, NetworkPayload } from '../../shared/network/shared-network-model';

export interface ServerNetworkMessage<T = NetworkPayload> extends NetworkMessage<T> {
   user: string;
}
