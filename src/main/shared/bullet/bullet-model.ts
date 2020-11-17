import * as Phaser from 'phaser';

export interface SimpleVector {
   readonly x: number;
   readonly y: number;
}

export interface Bullet {
   playerId: string;
   readonly position: Phaser.Math.Vector2 | SimpleVector;
   readonly direction: Phaser.Math.Vector2 | SimpleVector;
}
