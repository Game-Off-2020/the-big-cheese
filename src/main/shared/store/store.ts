import { StoreData, StoreEntity } from './store-model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as deepmerge from 'deepmerge';
import { filter, map } from 'rxjs/operators';
import { Utils } from '../util/utils';

export abstract class Store<T> {
   private readonly dataSubject = new BehaviorSubject<StoreData<T>>({}); // TODO: Can be simplified
   private readonly addedSubject = new Subject<StoreData<T>>();
   private readonly removedSubject = new Subject<string>();
   private readonly updatedSubject = new Subject<StoreData<T>>();
   private readonly committedSubject = new Subject<StoreData<T>>();
   private readonly changedSubject = new Subject<StoreData<T>>();

   readonly added$ = this.mapEntityWithId(this.addedSubject);
   readonly committed$ = this.mapEntityWithId(this.committedSubject);
   readonly updated$ = this.mapEntityWithId(this.updatedSubject);
   readonly removed$ = this.removedSubject.asObservable();

   private mapEntityWithId(source: Observable<StoreData<T>>): Observable<StoreEntity<T>> {
      return source.pipe(
         map((data) => {
            const [id, value] = Object.entries(data)[0];
            return { id, value };
         }),
      );
   }

   abstract getId(): string;

   // Return entity
   onUpdatedId(id: string): Observable<T> {
      return this.filterDataId(this.updatedSubject, id);
   }

   onCommittedId(id: string): Observable<T> {
      return this.filterDataId(this.committedSubject, id);
   }

   onChangedId(id: string): Observable<T> {
      return this.filterDataId(this.changedSubject, id);
   }

   private filterDataId(source: Observable<StoreData<T>>, id: string): Observable<T> {
      return source.pipe(
         map((data) => data[id]),
         filter((data) => !!data),
      );
   }

   // Change from higher-level
   update(id: string, value: T): void {
      const entityData = Utils.keyValueObject(id, value);
      this.setValue(id, entityData);
      this.updatedSubject.next(entityData);
   }

   // Change from lower-level
   commit(id: string, value: T): void {
      const entityData = Utils.keyValueObject(id, value);
      this.setValue(id, entityData);
      this.committedSubject.next(entityData);
   }

   remove(id: string): void {
      const data = this.getData();
      if (data[id]) {
         const mergedData = { ...data };
         delete mergedData[id];
         this.dataSubject.next(mergedData);
         this.removedSubject.next(id);
         this.committedSubject.next(Utils.keyValueObject(id, null));
      }
   }

   get(id: string): T | undefined {
      return this.getData()[id];
   }

   getData(): StoreData<T> {
      return this.dataSubject.getValue();
   }

   private setValue(id: string, entityData: StoreData<T>): void {
      const data = this.getData();
      const mergedData = deepmerge.all([data, entityData]) as StoreData<T>;
      this.dataSubject.next(mergedData);
      if (data[id]) {
         this.changedSubject.next(entityData);
      } else {
         this.addedSubject.next(entityData);
      }
   }

   protected reset(): void {
      this.dataSubject.next({});
   }
}
