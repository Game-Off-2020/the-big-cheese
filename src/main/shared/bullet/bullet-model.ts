export interface SimpleVector {
   readonly x: number;
   readonly y: number;
}

export interface Bullet {
   readonly playerId: string;
   readonly position: SimpleVector;
   readonly direction: SimpleVector;
}
