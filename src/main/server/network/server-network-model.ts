import { NetworkMessage } from '../../shared/network/shared-network-model';

export interface ServerNetworkMessage<T> extends NetworkMessage<T> {
   user: string;
}
