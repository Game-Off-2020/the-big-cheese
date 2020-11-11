import { StoreData, StoreEntity } from './store-model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as deepmerge from 'deepmerge';
import { filter, map } from 'rxjs/operators';
import { Utils } from '../util/utils';

export abstract class Store<T extends object> {
   private readonly dataSubject = new BehaviorSubject<StoreData<T>>({});
   private readonly addedSubject = new Subject<StoreData<T>>();
   private readonly removedSubject = new Subject<string>();
   private readonly updatedSubject = new Subject<StoreData<T>>();
   private readonly committedSubject = new Subject<StoreData<T>>();
   private readonly changedSubject = new Subject<StoreData<T>>();

   readonly data$ = this.dataSubject.pipe();
   readonly added$ = this.mapEntity(this.addedSubject); // Returns id+entity
   readonly removed$ = this.removedSubject.pipe();

   private mapEntity(source: Observable<StoreData<T>>): Observable<StoreEntity<T>> {
      return source.pipe(
         map((data) => {
            const [id, entity] = Object.entries(data)[0];
            return { id, entity };
         }),
      );
   }

   abstract getId(): string;

   // Returns entity
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
         filter((data) => Object.keys(data)[0] === id),
         map((data) => Object.values(data)[0]),
      );
   }

   // Change from higher-level
   update(id: string, entity: T): void {
      const entityData = Utils.keyValueObject(id, entity);
      this.setEntity(id, entityData);
      this.updatedSubject.next(entityData);
   }

   // Change from lower-level
   commit(id: string, entity: T): void {
      const entityData = Utils.keyValueObject(id, entity);
      this.setEntity(id, entityData);
      this.committedSubject.next(entityData);
   }

   remove(id: string): void {
      const data = this.dataSubject.getValue();
      if (data[id]) {
         const mergedData = { ...data };
         delete mergedData[id];
         this.dataSubject.next(mergedData);
         this.removedSubject.next(id);
      }
   }

   private setEntity(id: string, entityData: StoreData<T>): void {
      const data = this.dataSubject.getValue();
      const mergedData = deepmerge.all([data, entityData]) as StoreData<T>;
      this.dataSubject.next(mergedData);
      if (entityData[id]) {
         this.changedSubject.next(entityData);
      } else {
         this.addedSubject.next(entityData);
      }
   }
}
