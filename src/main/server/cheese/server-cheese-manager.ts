import { Inject, Singleton } from 'typescript-ioc';
import { ServerCheeseComponent } from './server-cheese-component';
import { ServerBulletComponent } from '../bullet/server-bullet-component';
import { ServerPlayerComponent } from '../player/server-player-component';
import { Vector } from '../../shared/bullet/vector-model';
import { filter } from 'rxjs/operators';
import { ServerConfig } from '../config/server-config';
import { ServerGameStateComponent } from '../game-state/server-game-state-component';

@Singleton
export class ServerCheeseManager {
   constructor(
      @Inject private readonly component: ServerCheeseComponent,
      @Inject private readonly bullet: ServerBulletComponent,
      @Inject private readonly players: ServerPlayerComponent,
      @Inject private readonly gameState: ServerGameStateComponent,
   ) {
      bullet.mapDamage$
         .pipe(filter((damage) => damage.radius >= ServerConfig.SHAKE_LIMIT))
         .subscribe((damage) => this.add(damage.position, 1));
      players.dropCheese$.subscribe((drop) => this.add(drop.position, drop.amount, 2));
      gameState.finished$.subscribe(() => component.removeAll());
   }

   private add(position: Vector, amount: number, deviationRatio: number): void {
      for (let i = 0; i < amount; i++) {
         this.component.add(
            position.x + Math.random() * 20 * deviationRatio - 10 * deviationRatio,
            position.y + Math.random() * 20 * deviationRatio - 10 * deviationRatio,
         );
      }
   }
}
