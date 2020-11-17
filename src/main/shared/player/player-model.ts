import { Vector } from '../bullet/bullet-model';

export interface Player {
   id: string;
   name: string;
   position: Vector;
   direction: Vector;
   //hp: number;
   // TODO: direction (left or right)
   // TODO: movement status (moving, standing or maybe jumping too)
}
