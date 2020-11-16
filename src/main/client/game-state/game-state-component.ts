import { Singleton } from 'typescript-ioc';
import { Subject } from 'rxjs';
import { JoinRequest } from '../../shared/network/shared-network-model';

@Singleton
export class GameStateComponent {
   private gameStartedSubject = new Subject<JoinRequest>();
   readonly joinGame$ = this.gameStartedSubject.asObservable();

   joinGame(userName: string): void {
      this.gameStartedSubject.next({
         userName,
      } as JoinRequest);
   }
}
