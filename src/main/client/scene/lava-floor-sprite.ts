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
      this.lavaTexture.context.fillStyle = '#7aeb34';
      this.lavaTexture.context.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, true);
      this.lavaTexture.context.fill();
      this.lavaTexture.refresh();

      options.scene.add.existing(this);

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
