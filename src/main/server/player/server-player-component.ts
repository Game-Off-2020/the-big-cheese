import { Inject, Singleton } from 'typescript-ioc';
import { Player } from '../../shared/player/player-model';
import { PlayerStore } from '../../shared/player/player-store';
import { ServerMapComponent } from '../map/server-map-component';
import { CollisionPhysics } from './collision-physics/collision-physics';
import { ServerConfig } from '../config/server-config';
import { MathUtil } from '../../client/util/math-util';

@Singleton
export class ServerPlayerComponent {
   constructor(
      @Inject private readonly store: PlayerStore,
      @Inject private readonly map: ServerMapComponent,
      @Inject private readonly collisionPhysics: CollisionPhysics,
   ) {
      store.changed$.subscribe((entity) => {
         if (entity.value.position) {
            // Width and height must be switched for some reason
            collisionPhysics.updatePosition(
               entity.id,
               entity.value.position.x,
               entity.value.position.y - ServerConfig.PLAYER_WIDTH / 2,
            );
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
         hp: 1.0,
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

   raycast(x1: number, y1: number, x2: number, y2: number, exceptId: string): [number, number] | null {
      return this.collisionPhysics.raycast(x1, y1, x2, y2, exceptId);
   }

   dealDamage(id: string, damage: number): number | null {
      const player = this.store.get(id);
      if (player) {
         if (player.hp === 0) return null;
         const hp = Math.max(0, player.hp - damage);
         this.store.commit(id, { hp } as Player);
         return hp;
      }
      return null;
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
}
