import { Inject, Singleton } from 'typescript-ioc';
import { PlayerStore } from '../../../shared/player/player-store';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PlayerScore } from './scoreboard-model';

@Singleton
export class ScoreboardComponent {
   protected readonly changedSubject = new Subject<PlayerScore[]>();
   readonly changed$ = this.changedSubject.asObservable();

   private scoreboard = new Map<string, PlayerScore>();

   constructor(@Inject private readonly store: PlayerStore) {
      store.updated$.pipe(filter((entity) => entity.value.cheese !== undefined)).subscribe((entity) => {
         const score = this.scoreboard.get(entity.id);
         score.count = entity.value.cheese;
         this.scoreboard.set(entity.id, score);
         this.changed();
      });
      store.added$.subscribe((entity) => {
         this.scoreboard.set(entity.id, {
            name: entity.value.name,
            count: 0,
         });
         this.changed();
      });
      store.removed$.subscribe((id) => {
         this.scoreboard.delete(id);
         this.changed();
      });
   }

   private changed(): void {
      const scoreboard = Array.from(this.scoreboard.values());
      scoreboard.sort((a, b) => b.count - a.count); // DESC
      this.changedSubject.next(scoreboard);
   }
}
