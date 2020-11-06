import { Singleton } from "typescript-ioc";
import { fromEvent, Observable } from "rxjs";

@Singleton
export class WindowEventComponent {
   readonly resize$: Observable<Event>;

   constructor() {
      this.resize$ = fromEvent(window, "resize");
   }
}
