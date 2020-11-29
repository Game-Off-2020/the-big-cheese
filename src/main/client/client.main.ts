import './main.scss';

import { Container, Inject, Singleton } from 'typescript-ioc';
import { GameManager } from './game/game-manager';
import { ClientNetworkManager } from './network/client-network-manager';
import { ClientPlayerManager } from './player/client-player-manager';
import { ClientMapManager } from './map/client-map-manager';
import { ClientCheeseManager } from './cheese/client-cheese-manager';
import { ClientGameStateManager } from './game-state/client-game-state-manager';

@Singleton
export class ClientMain {
   constructor(
      @Inject private readonly game: GameManager,
      @Inject private readonly network: ClientNetworkManager,
      @Inject private readonly player: ClientPlayerManager,
      @Inject private readonly map: ClientMapManager,
      @Inject private readonly cheese: ClientCheeseManager,
      @Inject private readonly gameState: ClientGameStateManager,
   ) {}
}

Container.get(ClientMain);
