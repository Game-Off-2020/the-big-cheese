import { Inject, Singleton } from 'typescript-ioc';
import { ServerCheeseComponent } from './server-cheese-component';
import { ServerBulletComponent } from '../bullet/server-bullet-component';
import { ServerPlayerComponent } from '../player/server-player-component';
import { Vector } from '../../shared/bullet/vector-model';
import { filter } from 'rxjs/operators';
import { ServerConfig } from '../config/server-config';
import { ServerGameStateComponent } from '../game-state/server-game-state-component';
import { CheeseType } from '../../shared/cheese/cheese-model';
import { MathUtil } from '../../client/util/math-util';

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
         .subscribe((damage) => this.addRandom(damage.position));
      players.dropCheese$.subscribe((drop) => this.add(drop.position, drop.amount, 2, CheeseType.CHEESE));
      gameState.finished$.subscribe(() => component.removeAll());
      component.pickup$
         .pipe(filter((pickup) => pickup.type === CheeseType.BOMB))
         .subscribe((pickup) => this.add(pickup.position, 30, 4, CheeseType.CHEESE));
   }

   private addRandom(position: Vector): void {
      let type = CheeseType.CHEESE;
      const rand = MathUtil.randomIntFromInterval(0, 100);
      if (rand < 3) {
         // 3% chance
         type = CheeseType.DOUBLE_BARREL;
      }
      if (rand >= 3 && rand < 6) {
         // 3% chance
         type = CheeseType.CHEESE_DOUBLE;
      }
      if (rand >= 6 && rand < 9) {
         // 3% chance
         type = CheeseType.CHEESE_HALF;
      }
      if (rand >= 9 && rand < 12) {
         // 3% chance
         type = CheeseType.BOMB;
      }
      this.add(position, 1, 1, type);
   }

   private add(position: Vector, amount: number, deviationRatio: number, type: CheeseType): void {
      for (let i = 0; i < amount; i++) {
         this.component.add(
            position.x + Math.random() * 20 * deviationRatio - 10 * deviationRatio,
            position.y + Math.random() * 20 * deviationRatio - 10 * deviationRatio,
            type,
         );
      }
   }
}
