import { Inject, Singleton } from 'typescript-ioc';
import { RestApiController } from './rest-api-controller';
import { ServerPlayerComponent } from '../player/server-player-component';

@Singleton
export class ServerStatusComponent {
   constructor(
      @Inject private readonly controller: RestApiController,
      @Inject private readonly players: ServerPlayerComponent,
   ) {
      controller.statusGet$.subscribe((reply) =>
         reply({
            players: players.getNrOfPlayers(),
         }),
      );
   }
}
