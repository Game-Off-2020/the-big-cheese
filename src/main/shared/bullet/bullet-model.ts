export interface Vector {
   readonly x: number;
   readonly y: number;
}

export interface Bullet {
   readonly playerId: string;
   readonly position: Vector;
   readonly direction: Vector;
}
