import { Inject, Singleton } from 'typescript-ioc';
import { ServerMapComponent } from './server-map-component';
import { SharedMapManager } from '../../shared/map/shared-map-manager';
import { MapStore } from '../../shared/map/map-store';
import { ServerConfig } from '../config/server-config';
import { ServerBulletComponent } from '../bullet/server-bullet-component';
import { ServerGameStateComponent } from '../game-state/server-game-state-component';
import { interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ServerCheeseComponent } from '../cheese/server-cheese-component';
import { CheeseType } from '../../shared/cheese/cheese-model';

@Singleton
export class ServerMapManager extends SharedMapManager {
   constructor(
      @Inject protected readonly component: ServerMapComponent,
      @Inject protected readonly store: MapStore,
      @Inject private readonly bullet: ServerBulletComponent,
      @Inject private readonly gameState: ServerGameStateComponent,
      @Inject private readonly cheese: ServerCheeseComponent,
   ) {
      super(component, store);
      gameState.startPlaying$.subscribe(() => component.init(ServerConfig.MOON_RADIUS));
      gameState.finished$.subscribe(() => component.clearMoonPixels());
      bullet.damage$.subscribe((destruction) => component.destruct(destruction));
      cheese.pickup$.pipe(filter((pickup) => pickup.type === CheeseType.BOMB)).subscribe((pickup) =>
         component.destruct({
            position: pickup.position,
            radius: 50,
         }),
      );
      interval(1000)
         .pipe(filter(() => gameState.isPlaying()))
         .subscribe(() => component.updateMoonPixelPercentage());
   }
}
