export class MathUtil {
   static randomIntFromInterval(min: number, max: number): number {
      return Math.floor(this.randomFloatFromInterval(min, max));
   }

   static randomFloatFromInterval(min: number, max: number): number {
      return Math.random() * (max - min + 1) + min;
   }

   static clamp(num: number, min: number, max: number): number {
      return num <= min ? min : num >= max ? max : num;
   }
}
