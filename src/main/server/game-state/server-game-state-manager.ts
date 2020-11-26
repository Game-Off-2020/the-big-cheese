import { Inject, Singleton } from 'typescript-ioc';
import { ServerGameStateComponent } from './server-game-state-component';
import { ServerMapComponent } from '../map/server-map-component';
import { ServerConfig } from '../config/server-config';
import { delay } from 'rxjs/operators';

@Singleton
export class ServerGameStateManager {
   constructor(
      @Inject private readonly component: ServerGameStateComponent,
      @Inject private readonly map: ServerMapComponent,
   ) {
      map.moonPercentageChange$.subscribe((moonPercentage) => {
         component.setMoonPercentage(moonPercentage);
         if (moonPercentage === 0) {
            component.finish();
         }
      });
      component.finished$.pipe(delay(ServerConfig.GAME_RESTART_TIME_MS)).subscribe(() => component.startPlaying());
      component.startPlaying();
   }
}
