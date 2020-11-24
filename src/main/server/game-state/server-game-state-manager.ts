import { Inject, Singleton } from 'typescript-ioc';
import { ServerGameStateComponent } from './server-game-state-component';
import { ServerMapComponent } from '../map/server-map-component';

@Singleton
export class ServerGameStateManager {
   constructor(
      @Inject private readonly component: ServerGameStateComponent,
      @Inject private readonly map: ServerMapComponent,
   ) {
      map.moonPercentageChange$.subscribe((moonPercentage) => component.setMoonPercentage(moonPercentage));
   }
}
