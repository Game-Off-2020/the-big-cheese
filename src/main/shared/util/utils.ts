export class Utils {
   static keyValueObject<T>(key: string, value: T): { [key: string]: T } {
      const object: { [key: string]: T } = {};
      object[key] = value;
      return object;
   }

   static generateId(): string {
      return (Math.random() + 1).toString(36).substring(7);
   }
}
