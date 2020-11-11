export interface StoreData<T extends object> {
   [key: string]: T;
}

export interface StoreEntity<T> {
   id: string;
   entity: T;
}
