export interface StoreData<T> {
   [key: string]: T;
}

export interface StoreEntity<T> {
   id: string;
   value: T;
}
