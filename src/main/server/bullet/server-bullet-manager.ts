import { Inject, Singleton } from 'typescript-ioc';
import { ServerNetworkComponent } from '../network/server-network-component';
import { ServerBulletComponent } from './server-bullet-component';
import { ServerTimerComponent } from '../timer/server-timer-component';
import { BulletStore } from '../../shared/bullet/bullet-store';

@Singleton
export class ServerBulletManager {
   constructor(
      @Inject private readonly component: ServerBulletComponent,
      @Inject private readonly network: ServerNetworkComponent,
      @Inject private readonly timer: ServerTimerComponent,
      @Inject private readonly store: BulletStore,
   ) {
      network.shootRequest$.subscribe((message) => component.shoot(message.user, message.value));
      timer.tick$.subscribe(() => component.stepBullets());
      store.added$.subscribe((entity) => component.stepBullet(entity.id, entity.value));
   }
}
