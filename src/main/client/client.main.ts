import './main.scss';

import { Container, Inject, Singleton } from 'typescript-ioc';
import { GameManager } from './game/game-manager';
import { NetworkManager } from './network/network-manager';
import { PlayerManager } from './player/player-manager';

@Singleton
export class ClientMain {
   constructor(
      @Inject private readonly game: GameManager,
      @Inject private readonly network: NetworkManager,
      @Inject private readonly player: PlayerManager,
   ) {}
}

Container.get(ClientMain);
