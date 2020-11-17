import { Inject, Singleton } from 'typescript-ioc';
import { BulletGroupComponent } from './bullet-group-component';
import { GameStateComponent } from '../game-state/game-state-component';
import { ClientNetworkComponent } from '../network/client-network-component';
import { BulletStore } from '../../shared/bullet/bullet-store';

@Singleton
export class BulletGroupManager {
   constructor(
      @Inject private readonly component: BulletGroupComponent,
      @Inject private readonly gameState: GameStateComponent,
      @Inject private readonly network: ClientNetworkComponent,
      @Inject private readonly bulletStore: BulletStore,
   ) {}
}
