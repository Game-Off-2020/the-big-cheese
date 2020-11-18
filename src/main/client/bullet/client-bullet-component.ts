import * as Phaser from 'phaser';
import { Inject, Singleton } from 'typescript-ioc';
import { Bullets } from './default-bullet';
import { BulletStore } from '../../shared/bullet/bullet-store';

@Singleton
export class ClientBulletComponent {
   constructor(@Inject protected readonly store: BulletStore) {}

   setBulletGroup(bulletGroup: Bullets): void {
      this.store.added$.subscribe((data) => {
         console.log('fire', data);
         bulletGroup.fireBullet({
            position: new Phaser.Math.Vector2(data.value.position),
            direction: new Phaser.Math.Vector2(data.value.direction),
         });
      });
   }
}
