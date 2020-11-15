import { IObject } from '../util/util-model';

export interface MapDestruction extends IObject {
   position: {
      x: number;
      y: number;
   };
   radius: number;
}
