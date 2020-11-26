import { Vector } from '../bullet/vector-model';

export interface Player {
   id: string;
   name: string;
   position: Vector;
   direction: Vector;
   moving: boolean;
   cheese: number;
   type: PlayerType;
}

export enum PlayerType {
   GREEN,
}
