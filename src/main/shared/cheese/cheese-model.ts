import { Vector } from '../bullet/vector-model';

export interface Cheese {
   position: Vector;
}

export interface DropCheese {
   position: Vector;
   amount: number;
}
