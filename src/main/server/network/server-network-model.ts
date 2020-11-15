import { NetworkMessage } from '../../shared/network/shared-network-model';
import { IObject } from '../../shared/util/util-model';

export interface ServerNetworkMessage<T extends IObject = IObject> extends NetworkMessage<T> {
   user: string;
}
