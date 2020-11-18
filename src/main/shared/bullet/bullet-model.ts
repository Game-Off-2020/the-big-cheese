export interface Vector {
   x: number;
   y: number;
}

export interface Bullet {
   readonly playerId: string;
   readonly position: Vector;
   readonly direction: Vector;
}
