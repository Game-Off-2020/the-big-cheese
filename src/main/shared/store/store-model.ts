import { IObject } from '../util/util-model';

export interface StoreData<T extends IObject> {
   [key: string]: T;
}

export interface StoreEntity<T> {
   id: string;
   entity: T;
}
