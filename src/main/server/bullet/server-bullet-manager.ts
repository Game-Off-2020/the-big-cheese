import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkComponent } from '../network/server-network-component';
import { ServerBulletComponent } from './server-bullet-component';
import { ServerTimerComponent } from '../timer/server-timer-component';
import { BulletStore } from '../../shared/bullet/bullet-store';
import { filter } from 'rxjs/operators';
import { ServerGameStateComponent } from '../game-state/server-game-state-component';

@Singleton
export class ServerBulletManager {
   constructor(
      @Inject private readonly component: ServerBulletComponent,
      @Inject private readonly network: ServerNetworkComponent,
      @Inject private readonly timer: ServerTimerComponent,
      @Inject private readonly store: BulletStore,
      @Inject private readonly gameState: ServerGameStateComponent,
   ) {
      network.shootRequest$
         .pipe(filter(() => gameState.isPlaying()))
         .subscribe((message) => component.shoot(message.user, message.value));
      timer.tick$.pipe(filter(() => gameState.isPlaying())).subscribe(() => component.stepBullets());
      gameState.finished$.subscribe(() => component.removeAll());
   }
}
