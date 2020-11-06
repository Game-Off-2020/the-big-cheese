import { MenuButton } from "../ui/menu-button";

export class MainMenuScene extends Phaser.Scene {
   constructor() {
      super({
         active: false,
         visible: false,
         key: "MainMenu" // TODO: Extract key
      });
   }

   create(): void {
      this.add
         .text(100, 50, "This is a sample main menu. Click the \"Start\" button below to run your game.", {
            fill: "#FFFFFF"
         })
         .setFontSize(24);

      new MenuButton(this, 100, 150, "Start Game", () => {
         this.scene.start("Game"); // TODO: Extract key
      });

      // new MenuButton(this, 100, 250, "Settings", () => console.log("settings button clicked"));

      // new MenuButton(this, 100, 350, "Help", () => console.log("help button clicked"));
   }
}
