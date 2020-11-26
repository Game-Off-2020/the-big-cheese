import { Inject, Singleton } from 'typescript-ioc';
import { GameStateStore } from '../../shared/game-state/game-state-store';
import { GamePhase, GameState } from '../../shared/game-state/game-state-model';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Singleton
export class ServerGameStateComponent {
   private phaseChangedSubject = new Subject<GamePhase>();
   readonly startPlaying$: Observable<void>;
   readonly finished$: Observable<void>;
   private phase: GamePhase;

   constructor(@Inject private readonly store: GameStateStore) {
      this.startPlaying$ = this.phaseChangedSubject.pipe(
         filter((phase) => phase === GamePhase.PLAYING),
         map(() => null),
      );
      this.finished$ = this.phaseChangedSubject.pipe(
         filter((phase) => phase === GamePhase.FINISHED),
         map(() => null),
      );
      this.startPlaying();
   }

   startPlaying(): void {
      this.changePhase(GamePhase.PLAYING);
   }

   finish(): void {
      this.changePhase(GamePhase.FINISHED);
   }

   isPlaying(): boolean {
      return this.phase === GamePhase.PLAYING;
   }

   setMoonPercentage(moonPercentage: number): void {
      this.store.commit(GameStateStore.ENTITY_ID, { moonPercentage } as GameState);
   }

   private changePhase(phase: GamePhase): void {
      this.phase = phase;
      this.store.commit(GameStateStore.ENTITY_ID, { phase } as GameState);
      this.phaseChangedSubject.next(phase);
   }
}
