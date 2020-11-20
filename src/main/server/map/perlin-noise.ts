/* eslint-disable */
import { Canvas, createCanvas } from 'canvas';

// Based on https://github.com/joeiddon/perlin/blob/master/perlin.js
export class PerlinNoise {
   generate(size: number): Canvas {
      let canvas = createCanvas(size, size);
      let ctx = canvas.getContext('2d');

      let grid_size = size / 5;
      let pixels = size;
      let pix_size = canvas.width / pixels;

      this.seed();
      for (let y = 0; y < grid_size; y += grid_size / pixels) {
         for (let x = 0; x < grid_size; x += grid_size / pixels) {
            let v = Math.abs(this.get(x, y));
            // let v = perlin.get(x, y) / 2 + 0.5;
            v *= 255;
            v = Math.round(v);
            v = v > 28 ? 255 : 0;
            ctx.fillStyle = `rgb(${v},${v},${v})`;
            ctx.fillRect(x * (canvas.width / grid_size), y * (canvas.width / grid_size), pix_size, pix_size);
         }
      }
      return canvas;
   }

   private rand_vect() {
      let theta = Math.random() * 2 * Math.PI;
      return { x: Math.cos(theta), y: Math.sin(theta) };
   }

   private dot_prod_grid(x: number, y: number, vx: number, vy: number) {
      let g_vect;
      let d_vect = { x: x - vx, y: y - vy };
      // @ts-ignore
      if (this.gradients[[vx, vy]]) {
         // @ts-ignore
         g_vect = this.gradients[[vx, vy]];
      } else {
         g_vect = this.rand_vect();
         // @ts-ignore
         this.gradients[[vx, vy]] = g_vect;
      }
      return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
   }

   private smootherstep(x: number) {
      return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
   }

   private interp(x: number, a: number, b: number) {
      return a + this.smootherstep(x) * (b - a);
   }

   private seed() {
      this.gradients = {};
   }

   private gradients = {};
   private memory = {};

   private get(x: number, y: number) {
      // @ts-ignore
      if (this.memory.hasOwnProperty([x, y])) return this.memory[[x, y]];
      let xf = Math.floor(x);
      let yf = Math.floor(y);
      let tl = this.dot_prod_grid(x, y, xf, yf);
      let tr = this.dot_prod_grid(x, y, xf + 1, yf);
      let bl = this.dot_prod_grid(x, y, xf, yf + 1);
      let br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
      let xt = this.interp(x - xf, tl, tr);
      let xb = this.interp(x - xf, bl, br);
      let v = this.interp(y - yf, xt, xb);
      // @ts-ignore
      this.memory[[x, y]] = v;
      return v;
   }
}
