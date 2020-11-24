import { Inject, Singleton } from 'typescript-ioc';
import { CheeseStore } from '../../shared/cheese/cheese-store';
import { Observable } from 'rxjs';
import { Cheese } from '../../shared/cheese/cheese-model';
import { StoreEntity } from '../../shared/store/store-model';

@Singleton
export class ClientCheeseComponent {
   readonly added$: Observable<StoreEntity<Cheese>>;
   readonly removed$: Observable<string>;

   constructor(@Inject private readonly store: CheeseStore) {
      this.added$ = store.added$;
      this.removed$ = store.removed$;
   }
}
