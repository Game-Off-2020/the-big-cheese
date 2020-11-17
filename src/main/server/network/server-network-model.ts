import { NetworkMessage } from '../../shared/network/shared-network-model';
import { IObject } from '../../shared/util/util-model';

export interface ServerNetworkMessage<T = IObject> extends NetworkMessage<T> {
   user: string;
}
