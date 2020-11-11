import { IObject } from '../util/util-model';

export interface Player extends IObject {
   id: string;
   name: string;
   position: {
      x: number;
      y: number;
   };
}
