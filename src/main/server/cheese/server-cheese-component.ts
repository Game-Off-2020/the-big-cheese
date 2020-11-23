import { Inject, Singleton } from 'typescript-ioc';
import { CollisionPhysics } from '../player/collision-physics/collision-physics';
import { CheeseStore } from '../../shared/cheese/cheese-store';
import { Subject } from 'rxjs';
import { Utils } from '../../shared/util/utils';

const CHEESE_SIZE = 20;

@Singleton
export class ServerCheeseComponent {
   private readonly pickupSubject = new Subject<string>();
   readonly pickup$ = this.pickupSubject.asObservable();

   constructor(
      @Inject private readonly store: CheeseStore,
      @Inject private readonly collisionPhysics: CollisionPhysics,
   ) {}

   add(x: number, y: number): void {
      const id = Utils.generateId();
      this.store.commit(id, {
         position: { x, y },
      });
      this.collisionPhysics.add(id, x, y, CHEESE_SIZE, CHEESE_SIZE);
   }

   checkPickup(playerId: string, x: number, y: number, w: number, h: number): void {
      this.collisionPhysics.getIdsInRectangle(x, y, w, h).forEach((id) => this.pickup(id, playerId));
   }

   private pickup(id: string, playerId: string): void {
      if (this.store.get(id)) {
         this.store.remove(id);
         this.collisionPhysics.remove(id);
         this.pickupSubject.next(playerId);
      }
   }
}
