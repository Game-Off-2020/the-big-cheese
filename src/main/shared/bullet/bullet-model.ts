import { IObject } from '../util/util-model';

export interface Bullet extends IObject {
   playerId: string;
   position: {
      x: number;
      y: number;
   };
   direction: {
      x: number;
      y: number;
   };
}
