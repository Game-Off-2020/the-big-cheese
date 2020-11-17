import * as Phaser from 'phaser';
import { Inject, Singleton } from 'typescript-ioc';

import { Player } from '../../shared/player/player-model';
import { Subject } from 'rxjs';
import { BulletFireOptions, Bullets } from './default-bullet';
import { BulletStore } from '../../shared/bullet/bullet-store';

@Singleton
export class BulletGroupComponent {
   private readonly clientInitSubject = new Subject<Player>();
   readonly clientInit$ = this.clientInitSubject.asObservable();
   private readonly clientShootingSubject = new Subject<BulletFireOptions>();
   readonly clientShooting$ = this.clientShootingSubject.asObservable();

   private bulletGroup: Bullets;

   constructor(@Inject protected readonly store: BulletStore) {}

   setBulletGroup(bulletGroup: Bullets): void {
      this.bulletGroup = bulletGroup;

      this.store.added$.subscribe((data) => {
         this.bulletGroup.fireBullet({
            position: new Phaser.Math.Vector2(data.value.position),
            direction: new Phaser.Math.Vector2(data.value.direction),
         });
      });
   }
}
