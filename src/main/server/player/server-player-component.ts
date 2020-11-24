import { Inject, Singleton } from 'typescript-ioc';
import { Player } from '../../shared/player/player-model';
import { PlayerStore } from '../../shared/player/player-store';
import { ServerMapComponent } from '../map/server-map-component';
import { CollisionPhysics } from './collision-physics/collision-physics';
import { ServerConfig } from '../config/server-config';
import { Vector } from '../../shared/bullet/vector-model';
import { ServerCheeseComponent } from '../cheese/server-cheese-component';
import { Damage } from '../bullet/server-bullet-model';
import { DropCheese } from '../../shared/cheese/cheese-model';
import { Subject } from 'rxjs';
import { MathUtil } from '../../client/util/math-util';

@Singleton
export class ServerPlayerComponent {
   private readonly dropCheeseSubject = new Subject<DropCheese>();
   readonly dropCheese$ = this.dropCheeseSubject.asObservable();

   constructor(
      @Inject private readonly store: PlayerStore,
      @Inject private readonly map: ServerMapComponent,
      @Inject private readonly ammo: ServerCheeseComponent,
      @Inject private readonly collisionPhysics: CollisionPhysics,
   ) {
      store.changed$.subscribe((entity) => {
         if (entity.value.position) {
            this.handlePlayerPositionChanged(entity.id, entity.value.position);
         }
      });
   }

   add(id: string, name: string): void {
      const position = this.map.getRandomPositionAboveSurface(30);
      this.store.commit(id, {
         id,
         name: this.getUniqueName(name),
         position,
         direction: {
            x: 0,
            y: 0,
         },
         moving: false,
         cheese: 0.0,
         type: MathUtil.randomIntFromInterval(0, ServerConfig.NR_OF_PLAYER_TYPES),
      });
      // Width and height must be switched for some reason
      this.collisionPhysics.add(id, position.x, position.y, ServerConfig.PLAYER_HEIGHT, ServerConfig.PLAYER_WIDTH);
   }

   remove(id: string): void {
      this.store.remove(id);
      this.collisionPhysics.remove(id);
   }

   get(id: string): Player | undefined {
      return this.store.get(id);
   }

   getNrOfPlayers(): number {
      return this.store.getIds().length;
   }

   getIdsInRadius(x: number, y: number, radius: number): string[] {
      return this.collisionPhysics.getIdsInRadius(x, y, radius);
   }

   raycast(x1: number, y1: number, x2: number, y2: number, exceptId: string): [number, number, string] | null {
      return this.collisionPhysics.raycast(x1, y1, x2, y2, exceptId);
   }

   dealDamage(damage: Damage): void {
      this.getIdsInRadius(damage.position.x, damage.position.y, damage.radius)
         .filter((playerId) => playerId !== damage.playerId)
         .forEach((playerId) => {
            const cheeseRemoved = this.removeSomeCheese(playerId);
            if (cheeseRemoved) {
               this.dropCheeseSubject.next({
                  position: damage.position,
                  amount: cheeseRemoved,
               });
            }
         });
   }

   private removeSomeCheese(id: string): number {
      const player = this.store.get(id);
      if (player) {
         const cheese = Math.max(0, player.cheese - Math.ceil(player.cheese * 0.2));
         this.store.commit(id, { cheese } as Player);
         return player.cheese - cheese;
      }
      return 0;
   }

   addCheese(id: string): void {
      const player = this.store.get(id);
      if (player) {
         this.store.commit(id, { cheese: ++player.cheese } as Player);
      }
   }

   private getUniqueName(name: string): string {
      const playerWithThisName = Array.from(Object.values(this.store.getData())).find((player) => player.name === name);
      if (playerWithThisName) {
         const nameSplit = name.split(' ');
         if (nameSplit.length > 1) {
            let nameEndingNumber = parseInt(nameSplit[nameSplit.length - 1]);
            if (Number.isFinite(nameEndingNumber)) {
               nameEndingNumber++;
               nameSplit[nameSplit.length - 1] = nameEndingNumber.toString();
               return this.getUniqueName(nameSplit.join(' '));
            }
         }
         nameSplit.push('1');
         return this.getUniqueName(nameSplit.join(' '));
      }
      return name;
   }

   private handlePlayerPositionChanged(playerId: string, position: Vector): void {
      this.collisionPhysics.updatePosition(playerId, position.x, position.y);
      // TODO: Check lava distance and kill if closer
      this.ammo.checkPickup(playerId, position.x, position.y, ServerConfig.PLAYER_WIDTH, ServerConfig.PLAYER_HEIGHT);
   }
}
