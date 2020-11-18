import * as Phaser from 'phaser';
export interface Bullet {
   playerId: string;
   readonly position: Phaser.Math.Vector2;
   readonly direction: Phaser.Math.Vector2;
}
