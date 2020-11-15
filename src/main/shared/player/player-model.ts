import { IObject } from '../util/util-model';

export interface Player extends IObject {
   id: string;
   name: string;
   position: {
      x: number;
      y: number;
   };
   direction: {
      x: number;
      y: number;
   };
   //hp: number;
   // TODO: direction (left or right)
   // TODO: movement status (moving, standing or maybe jumping too)
}
