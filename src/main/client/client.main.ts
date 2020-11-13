import './main.scss';

import { Container, Inject, Singleton } from 'typescript-ioc';
import { GameManager } from './game/game-manager';
import { ClientNetworkManager } from './network/client-network-manager';
import { PlayerManager } from './player/player-manager';

@Singleton
export class ClientMain {
   constructor(
      @Inject private readonly game: GameManager,
      @Inject private readonly network: ClientNetworkManager,
      @Inject private readonly player: PlayerManager,
   ) {}
}

Container.get(ClientMain);
