export function randomIntFromInterval(min: number, max: number): number {
   return Math.floor(randomFloatFromInterval(min, max));
}

export function randomFloatFromInterval(min: number, max: number): number {
   return Math.random() * (max - min + 1) + min;
}
