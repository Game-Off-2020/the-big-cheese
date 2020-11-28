import * as Phaser from 'phaser';
import { Inject, Singleton } from 'typescript-ioc';
import { Bullets } from './default-bullet';
import { BulletStore } from '../../shared/bullet/bullet-store';
import { ClientPlayerComponent } from '../player/client-player-component';

@Singleton
export class ClientBulletComponent {
   constructor(
      @Inject protected readonly store: BulletStore,
      @Inject protected readonly clientPlayer: ClientPlayerComponent,
   ) {}

   setBulletGroup(bulletGroup: Bullets): void {
      this.store.added$.subscribe((data) => {
         bulletGroup.fireBullet(data.id, {
            position: new Phaser.Math.Vector2(data.value.position),
            direction: new Phaser.Math.Vector2(data.value.direction),
            volume: this.clientPlayer.getVolume(data.value.position),
         });
      });

      this.store.removed$.subscribe((id) => {
         bulletGroup.killBullet(id);
      });
   }
}
