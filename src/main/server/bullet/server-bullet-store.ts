import { Singleton } from 'typescript-ioc';
import { BulletStore } from '../../shared/bullet/bullet-store';
import { ServerBullet } from './server-bullet-model';

@Singleton
export class ServerBulletStore extends BulletStore<ServerBullet> {
   constructor() {
      super();
   }
}
