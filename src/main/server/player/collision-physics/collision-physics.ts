import { ServerConfig } from '../../config/server-config';
import Quadtree, { QuadtreeItem } from 'quadtree-lib';

interface CollisionPhysicsItem extends QuadtreeItem {
   id: string;
   x: number;
   y: number;
   width: number;
   height: number;
}

interface Collision {
   x: number;
   y: number;
   distanceSquared: number;
}

export class CollisionPhysics {
   private readonly radius = ServerConfig.MOON_RADIUS;
   private readonly items = new Map<string, CollisionPhysicsItem>();

   // https://github.com/elbywan/quadtree-lib
   private readonly tree: Quadtree<CollisionPhysicsItem>;

   constructor() {
      this.tree = new Quadtree<CollisionPhysicsItem>({
         width: this.radius * 2,
         height: this.radius * 2,
      });
   }

   add(id: string, x: number, y: number, width: number, height: number): void {
      const item: CollisionPhysicsItem = {
         id,
         x: this.toLocalCoordinate(x),
         y: this.toLocalCoordinate(y) - width / 2, // Some adjustment
         width,
         height,
      };
      this.items.set(id, item);
      this.tree.push(item, true);
   }

   updatePosition(id: string, x: number, y: number): void {
      const item = this.items.get(id);
      if (item) {
         item.x = this.toLocalCoordinate(x);
         item.y = this.toLocalCoordinate(y) - item.width / 2; // Some adjustment
      }
   }

   remove(id: string): void {
      const item = this.items.get(id);
      if (item) {
         this.items.delete(id);
         this.tree.remove(item);
      }
   }

   getIdsInRadius(x: number, y: number, radius: number): string[] {
      x = this.toLocalCoordinate(x);
      y = this.toLocalCoordinate(y);
      return this.getItemsInRectangle(x - radius, y - radius, radius * 2, radius * 2)
         .filter((item) => this.raycastCircleToRectangle(x, y, radius, item.x, item.y, item.width, item.height))
         .map((item) => item.id);
   }

   getIdsInRectangle(x: number, y: number, w: number, h: number): string[] {
      x = this.toLocalCoordinate(x);
      y = this.toLocalCoordinate(y);
      return this.getItemsInRectangle(x, y, w, h).map((item) => item.id);
   }

   raycast(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      r: number,
      exceptId?: string,
   ): [number, number, string] | null {
      x1 = this.toLocalCoordinate(x1);
      x2 = this.toLocalCoordinate(x2);
      y1 = this.toLocalCoordinate(y1);
      y2 = this.toLocalCoordinate(y2);
      const itemsInRectangle = this.getItemsInRectangle(
         Math.min(x1, x2),
         Math.min(y1, y2),
         Math.abs(x1 - x2),
         Math.abs(y1 - y2),
      );
      if (itemsInRectangle.length) {
         for (const item of itemsInRectangle) {
            if (exceptId && item.id === exceptId) continue;
            const itemRectX = item.x;
            const itemRectY = item.y;
            // const itemRectWidth = item.width;
            // const itemRectHeight = item.height;
            if (this.raycastLineToCircle(x1, y1, x2, y2, itemRectX, itemRectY, r)) {
               return [this.toWorldCoordinate(itemRectX), this.toWorldCoordinate(itemRectY), item.id];
            }
         }
      }
      return null;
   }

   private getItemsInRectangle(x: number, y: number, width: number, height: number): CollisionPhysicsItem[] {
      return this.tree.colliding({ x, y, width, height });
   }

   // http://www.jeffreythompson.org/collision-detection/line-rect.php
   private raycastLineToRectangle(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      rx: number,
      ry: number,
      rw: number,
      rh: number,
   ): Collision | null {
      const left = this.raycastLineToLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
      const right = this.raycastLineToLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
      const top = this.raycastLineToLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
      const bottom = this.raycastLineToLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
      let closestCollision = left;
      for (const side of [right, top, bottom]) {
         if (side && (!closestCollision || side.distanceSquared < closestCollision.distanceSquared)) {
            closestCollision = side;
         }
      }
      return closestCollision;
   }

   // http://www.jeffreythompson.org/collision-detection/line-rect.php
   private raycastLineToLine(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      x3: number,
      y3: number,
      x4: number,
      y4: number,
   ): Collision | null {
      // calculate the direction of the lines
      const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
      const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

      // if uA and uB are between 0-1, lines are colliding
      if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
         const intersectionX = x1 + uA * (x2 - x1);
         const intersectionY = y1 + uA * (y2 - y1);
         const distanceSquared = Math.pow(intersectionX - x1, 2) + Math.pow(intersectionY - y1, 2);
         return {
            x: intersectionX,
            y: intersectionY,
            distanceSquared,
         };
      }
      return null;
   }

   // https://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
   private raycastCircleToRectangle(
      x1: number,
      y1: number,
      r: number,
      x2: number,
      y2: number,
      w: number,
      h: number,
   ): boolean {
      const distX = Math.abs(x1 - x2 - w / 2);
      const distY = Math.abs(y1 - y2 - h / 2);
      if (distX > w / 2 + r) return false;
      if (distY > h / 2 + r) return false;
      if (distX <= w / 2) return true;
      if (distY <= h / 2) return true;
      return Math.pow(distX - w / 2, 2) + Math.pow(distY - h / 2, 2) <= r * r;
   }

   private raycastLineToCircle(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      xc: number,
      yc: number,
      rc: number,
   ): boolean {
      const ac = [xc - x1, yc - y1];
      const ab = [x2 - x1, y2 - y1];
      const ab2 = this.dot(ab, ab);
      const acab = this.dot(ac, ab);
      let t = acab / ab2;
      t = t < 0 ? 0 : t;
      t = t > 1 ? 1 : t;
      const h = [ab[0] * t + x1 - xc, ab[1] * t + y1 - yc];
      const h2 = this.dot(h, h);
      return h2 <= rc * rc;
   }

   private dot(v1: number[], v2: number[]): number {
      return v1[0] * v2[0] + v1[1] * v2[1];
   }

   private toLocalCoordinate(worldXY: number): number {
      return Math.round(worldXY) + this.radius;
   }

   private toWorldCoordinate(localXY: number): number {
      return localXY - this.radius;
   }
}
