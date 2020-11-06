import { Inject, Singleton } from "typescript-ioc";
import { GameComponent } from "./game-component";
import { WindowEventComponent } from "../window/window-event-component";

@Singleton
export class GameManager {
   constructor(@Inject private readonly component: GameComponent,
               @Inject private readonly windowEvent: WindowEventComponent) {
      windowEvent.resize$.subscribe(() => component.refreshScale());
   }
}
