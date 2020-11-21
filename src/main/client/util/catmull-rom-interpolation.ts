import { Vector } from '../../shared/bullet/vector-model';

export class CatmullRomInterpolation {
   private readonly points: Vector[] = [];
   private vector: Vector = { x: 0, y: 0 };
   private time = 0;
   private readonly frameRate: number;
   private readonly timeLength: number;

   constructor(private readonly tickRate: number, private readonly size: number) {
      this.frameRate = 1000 / 60;
      this.timeLength = (size * 1000) / tickRate;
   }

   add(point: Vector): void {
      if (this.points.length === this.size) {
         this.points.shift();
      }
      this.points.push(point);
      if (this.time === 1) {
         this.time = 0;
         this.fill(point);
         return;
      }
      this.time = 0;
   }

   private fill(point: Vector): void {
      for (let i = 0; i < this.size; i++) {
         this.points[i] = point;
      }
   }

   step(): void {
      this.time += this.frameRate;
   }

   get(): Vector {
      this.vector.x = Phaser.Math.Interpolation.CatmullRom(
         this.points.map((p) => p.x),
         this.getCurveTimePoint(),
      );
      this.vector.y = Phaser.Math.Interpolation.CatmullRom(
         this.points.map((p) => p.y),
         this.getCurveTimePoint(),
      );
      return this.vector;
   }

   private getCurveTimePoint(): number {
      return Math.min(1, this.time / this.timeLength);
   }
}
