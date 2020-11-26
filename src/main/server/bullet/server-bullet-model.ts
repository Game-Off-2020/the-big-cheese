import { Bullet } from '../../shared/bullet/bullet-model';
import { Destruction } from '../../shared/map/map-model';

export interface ServerBullet extends Bullet {
   timestamp: number;
}

export interface Damage extends Destruction {
   playerId: string;
   collidedPlayerId?: string;
}
