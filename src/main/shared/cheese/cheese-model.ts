import { Vector } from '../bullet/vector-model';

export enum CheeseType {
   CHEESE,
   DOUBLE_BARREL,
   CHEESE_DOUBLE,
   CHEESE_HALF,
}

export interface Cheese {
   position: Vector;
   type: CheeseType;
}

export interface DropCheese {
   position: Vector;
   amount: number;
}

export interface PickupCheese {
   playerId: string;
   type: CheeseType;
}
