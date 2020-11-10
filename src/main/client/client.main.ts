import './main.scss';

import { Container, Inject, Singleton } from 'typescript-ioc';
import { GameManager } from './game/game-manager';
import { NetworkManager } from './network/network-manager';

@Singleton
export class ClientMain {
   constructor(@Inject private readonly game: GameManager, @Inject private readonly network: NetworkManager) {}
}

Container.get(ClientMain);
