import { SimpleVector } from "../bullet/bullet-model";

export interface Player {
   id: string;
   name: string;
   position: SimpleVector;
   direction: SimpleVector;
   //hp: number;
   // TODO: direction (left or right)
   // TODO: movement status (moving, standing or maybe jumping too)
}
