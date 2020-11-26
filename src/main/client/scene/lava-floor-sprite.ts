import * as Phaser from 'phaser';
import { Keys } from '../config/client-constants';
import { MathUtil } from '../util/math-util';

interface LavaFloorOptions {
   readonly scene: Phaser.Scene;
   readonly size: number;
}

export class LavaFloorSprite extends Phaser.GameObjects.Sprite {
   private lavaTexture;
   private radius;
   constructor(options: LavaFloorOptions) {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      canvas.width = options.size;
      canvas.height = options.size;

      const texture = options.scene.textures.addCanvas(Keys.LAVA, canvas);
      super(options.scene, 0, 0, Keys.LAVA);

      this.radius = canvas.width / 2;
      this.lavaTexture = texture;
      this.lavaTexture.context.beginPath();
      this.lavaTexture.context.fillStyle = '#ebb134';
      this.lavaTexture.context.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, true);
      this.lavaTexture.context.fill();
      this.lavaTexture.refresh();

      options.scene.add.existing(this);

      const shineParticles = this.scene.add.particles(Keys.FLARES);

      const origin = this.getTopLeft();

      shineParticles.createEmitter({
         frame: ['yellow'],
         x: 0,
         y: 0,
         lifespan: 1000,
         scale: { start: 0, end: 0.25, ease: 'Quad.easeOut' },
         alpha: { start: 1, end: 0, ease: 'Quad.easeIn' },
         blendMode: 'ADD',
         emitZone: {
            type: 'random',
            source: {
               getRandomPoint: (vec: Phaser.Math.Vector2) => {
                  let x;
                  let y;
                  let pixel;
                  do {
                     x = Phaser.Math.Between(0, this.width - 1);
                     y = Phaser.Math.Between(0, this.height - 1);
                     pixel = this.scene.textures.getPixel(x, y, Keys.LAVA);
                  } while (pixel.alpha < 255);
                  return vec.setTo(x + origin.x, y + origin.y);
               },
            },
         },
      });

      const particles = this.scene.add.particles(Keys.LAVA_SPIT);

      particles.createEmitter({
         x: 0,
         y: 0,
         lifespan: 1000,
         rotate: {
            start: 0,
            end: 180,
         },
         speedX: {
            onEmit: (particle) => {
               const position = new Phaser.Math.Vector2({ x: particle.x, y: particle.y })
                  .normalize()
                  .scale(100)
                  .rotate(MathUtil.randomFloatFromInterval(-0.2, 0.1));
               return position.x;
            },
         },
         speedY: {
            onEmit: (particle) => {
               const position = new Phaser.Math.Vector2({ x: particle.x, y: particle.y })
                  .normalize()
                  .scale(100)
                  .rotate(MathUtil.randomFloatFromInterval(-0.2, 0.1));
               return position.y;
            },
         },
         accelerationX: {
            onEmit: (particle) => {
               const position = new Phaser.Math.Vector2({ x: particle.x, y: particle.y }).normalize().scale(-200);
               return position.x;
            },
         },
         accelerationY: {
            onEmit: (particle) => {
               const position = new Phaser.Math.Vector2({ x: particle.x, y: particle.y }).normalize().scale(-200);
               return position.y;
            },
         },
         scale: 0.4,
         emitZone: {
            type: 'random',
            source: {
               getRandomPoint: (vec: Phaser.Math.Vector2) => {
                  const angle = Math.random() * Math.PI * 2;
                  const x = Math.cos(angle) * this.radius;
                  const y = Math.sin(angle) * this.radius;

                  return vec.setTo(x, y);
               },
            },
         },
      });
   }
}
