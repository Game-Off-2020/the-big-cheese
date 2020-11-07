import './main.scss';

import { Container, Inject, Singleton } from 'typescript-ioc';
import { GameManager } from './game/game-manager';

@Singleton
export class ClientMain {
   constructor(@Inject private readonly game: GameManager) {}
}

Container.get(ClientMain);
