import { NetworkMessage } from '../../client/network/network-model';

export interface ServerNetworkMessage extends NetworkMessage {
   user: string;
}
