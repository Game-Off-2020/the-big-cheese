export class Utils {
   static keyValueObject<T>(key: string, value: T): { [key: string]: T } {
      const object: { [key: string]: T } = {};
      object[key] = value;
      return object;
   }

   static generateId(): string {
      return (Date.now() * Math.round(Math.random() * 1000)).toString(36);
   }
}
