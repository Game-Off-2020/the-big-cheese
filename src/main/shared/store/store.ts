import { StoreData, StoreEntity } from './store-model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as deepmerge from 'deepmerge';
import { filter, map } from 'rxjs/operators';
import { Utils } from '../util/utils';
import { IObject } from '../util/util-model';

export abstract class Store<T extends IObject = IObject> {
   private readonly dataSubject = new BehaviorSubject<StoreData<T>>({});
   private readonly addedSubject = new Subject<StoreData<T>>();
   private readonly removedSubject = new Subject<string>();
   private readonly updatedSubject = new Subject<StoreData<T>>();
   private readonly committedSubject = new Subject<StoreData<T>>();
   private readonly changedSubject = new Subject<StoreData<T>>();

   readonly data$ = this.dataSubject.pipe();
   readonly added$ = this.mapEntity(this.addedSubject); // Returns id+value
   readonly committed$ = this.mapEntity(this.committedSubject); // Returns id+value
   readonly updated$ = this.mapEntity(this.updatedSubject); // Returns id+value
   readonly removed$ = this.removedSubject.pipe();

   private mapEntity(source: Observable<StoreData<T>>): Observable<StoreEntity<T>> {
      return source.pipe(
         map((data) => {
            const [id, value] = Object.entries(data)[0];
            return { id, value };
         }),
      );
   }

   abstract getId(): string;

   // Returns value
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
      }
   }

   private setValue(id: string, entityData: StoreData<T>): void {
      const data = this.getData();
      const mergedData = deepmerge.all([data, entityData]) as StoreData<T>;
      this.dataSubject.next(mergedData);
      if (entityData[id]) {
         this.changedSubject.next(entityData);
      } else {
         this.addedSubject.next(entityData);
      }
   }

   protected getData(): StoreData<T> {
      return this.dataSubject.getValue();
   }
}
