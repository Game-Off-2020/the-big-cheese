import { Inject, Singleton } from 'typescript-ioc';
import { ServerMapComponent } from './server-map-component';
import { SharedMapManager } from '../../shared/map/shared-map-manager';
import { MapStore } from '../../shared/map/map-store';
import { ServerConfig } from '../config/server-config';
import { ServerBulletComponent } from '../bullet/server-bullet-component';
import { ServerGameStateComponent } from '../game-state/server-game-state-component';
import { interval } from 'rxjs';
import { filter } from 'rxjs/operators';

@Singleton
export class ServerMapManager extends SharedMapManager {
   constructor(
      @Inject protected readonly component: ServerMapComponent,
      @Inject protected readonly store: MapStore,
      @Inject private readonly bullet: ServerBulletComponent,
      @Inject private readonly gameState: ServerGameStateComponent,
   ) {
      super(component, store);
      gameState.startPlaying$.subscribe(() => component.createMap(ServerConfig.MOON_RADIUS));
      gameState.finished$.subscribe(() => component.clearMoonPixels());
      bullet.damage$.subscribe((destruction) => component.destruct(destruction));
      interval(1000)
         .pipe(filter(() => gameState.isPlaying()))
         .subscribe(() => component.updateMoonPixelPercentage());
   }
}
