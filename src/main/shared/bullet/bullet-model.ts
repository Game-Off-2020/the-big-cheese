import { Vector } from './vector-model';

export interface Bullet {
   readonly playerId: string;
   readonly position: Vector;
   readonly direction: Vector;
}
