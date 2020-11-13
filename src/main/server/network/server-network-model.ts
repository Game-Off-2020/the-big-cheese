import { NetworkMessage } from '../../shared/network/shared-network-model';

export interface ServerNetworkMessage extends NetworkMessage {
   user: string;
}
