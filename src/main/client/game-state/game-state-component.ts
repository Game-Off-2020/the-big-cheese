import { Singleton } from 'typescript-ioc';
import { Subject } from 'rxjs';

@Singleton
export class GameStateComponent {
   private gameStartedSubject = new Subject();
   gameStarted$ = this.gameStartedSubject.pipe();

   startGame(): void {
      this.gameStartedSubject.next();
   }
}
