export class Utils {
   static keyValueObject<T>(key: string, value: T): { [key: string]: T } {
      const object: { [key: string]: T } = {};
      object[key] = value;
      return object;
   }
}
