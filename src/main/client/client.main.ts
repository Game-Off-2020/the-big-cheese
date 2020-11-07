import './main.scss';
import { Container, Inject, Singleton } from 'typescript-ioc';
import { GameManager } from './game/game-manager';

@Singleton
class ClientMain {
   constructor(@Inject private readonly game: GameManager) {}
}

Container.get(ClientMain);
