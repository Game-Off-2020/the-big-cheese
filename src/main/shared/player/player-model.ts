import { Vector } from '../bullet/vector-model';

export interface Player {
   id: string;
   name: string;
   position: Vector;
   direction: Vector;
   moving: boolean;
   cheese: number;
}
