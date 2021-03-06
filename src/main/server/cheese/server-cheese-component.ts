import { Inject, Singleton } from 'typescript-ioc';
import { CollisionPhysics } from '../player/collision-physics/collision-physics';
import { CheeseStore } from '../../shared/cheese/cheese-store';
import { Subject } from 'rxjs';
import { Utils } from '../../shared/util/utils';
import { CheeseType, PickupCheese } from '../../shared/cheese/cheese-model';
import { Vector } from '../../shared/bullet/vector-model';

@Singleton
export class ServerCheeseComponent {
   private readonly pickupSubject = new Subject<PickupCheese>();
   readonly pickup$ = this.pickupSubject.asObservable();

   constructor(
      @Inject private readonly store: CheeseStore,
      @Inject private readonly collisionPhysics: CollisionPhysics,
   ) {}

   add(x: number, y: number, type: CheeseType): void {
      const id = Utils.generateId();
      this.store.commit(id, {
         position: { x, y },
         type,
      });
      this.collisionPhysics.add(id, x, y, 1, 1);
   }

   removeAll(): void {
      for (const id of Object.keys(this.store.getData())) {
         this.remove(id);
      }
   }

   pickupInRadius(playerId: string, x: number, y: number, radius: number): void {
      this.collisionPhysics.getIdsInRadius(x, y, radius).forEach((id) => this.pickup(id, playerId, { x, y }));
   }

   private pickup(id: string, playerId: string, position: Vector): void {
      const cheese = this.store.get(id);
      if (cheese) {
         this.remove(id);
         this.pickupSubject.next({
            playerId,
            type: cheese.type,
            position,
         });
      }
   }

   private remove(id: string): void {
      this.store.remove(id);
      this.collisionPhysics.remove(id);
   }
}
