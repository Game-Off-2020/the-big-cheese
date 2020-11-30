import * as Phaser from 'phaser';
import { Keys } from '../config/client-constants';
import { MenuButton } from './menu-button';

export class HowToPlay extends Phaser.GameObjects.Container {
   constructor(scene: Phaser.Scene) {
      super(scene, scene.game.scale.width / 2, scene.game.scale.height / 2);

      const rectangle = new Phaser.GameObjects.Rectangle(scene, 0, 0, 700, 700, 0x000000, 0.9);
      rectangle.setOrigin(0.5, 0.5);
      this.add(rectangle);

      const controls = new Phaser.GameObjects.Image(scene, 0, -200, Keys.HOW_TO_PLAY_CONTROLS);
      this.add(controls);

      const cheese = new Phaser.GameObjects.Image(scene, -200, -50, Keys.CHEESE);
      cheese.setScale(0.3);
      this.add(cheese);

      const cheeseText = new Phaser.GameObjects.Text(
         scene,
         -130,
         -50,
         'Collect these to for points. \nA shiny spinny one will double your points',
         {
            fontSize: '30px',
            align: 'left',
            fontFamily: 'CactusStory',
            stroke: '#000000',
            strokeThickness: 6,
         },
      ).setOrigin(0, 0.5);
      this.add(cheeseText);

      const greenCheese = new Phaser.GameObjects.Image(scene, -200, 50, Keys.CHEESE_GREEN);
      greenCheese.setScale(0.3);
      this.add(greenCheese);

      const greenCheeseText = new Phaser.GameObjects.Text(
         scene,
         -130,
         50,
         'Avoid these. \nCollecting this will half your points',
         {
            fontSize: '30px',
            align: 'left',
            fontFamily: 'CactusStory',
            stroke: '#000000',
            strokeThickness: 6,
         },
      ).setOrigin(0, 0.5);
      this.add(greenCheeseText);

      const doubleBarrel = new Phaser.GameObjects.Image(scene, -200, 150, Keys.DOUBLE_BARREL);
      doubleBarrel.setScale(2);
      this.add(doubleBarrel);

      const doubleBarrelText = new Phaser.GameObjects.Text(
         scene,
         -130,
         150,
         'Collect this to shoot two bullets at once',
         {
            fontSize: '30px',
            align: 'left',
            fontFamily: 'CactusStory',
            stroke: '#000000',
            strokeThickness: 6,
         },
      ).setOrigin(0, 0.5);
      this.add(doubleBarrelText);

      const bomb = new Phaser.GameObjects.Image(scene, -200, 250, Keys.CHEESE_BOMB);
      bomb.setScale(1.7);
      this.add(bomb);

      const bombText = new Phaser.GameObjects.Text(scene, -130, 250, 'Trigger a big blast', {
         fontSize: '30px',
         align: 'left',
         fontFamily: 'CactusStory',
         stroke: '#000000',
         strokeThickness: 6,
      }).setOrigin(0, 0.5);
      this.add(bombText);

      const closeButton = new MenuButton({
         scene: scene,
         x: 225,
         y: 300,
         text: 'Close',
         onClick: () => {
            this.setVisible(false);
         },
         colors: {
            label: {
               over: '#FFFFFF',
               out: '#FFFFFF',
               down: '#BBBBBB',
               disabled: '#FFFFFF',
            },
            rectangle: {
               over: 0xffffff,
               out: 0x4287f5,
               down: 0x444444,
               disabled: 0x888888,
            },
         },
      });
      this.add(closeButton);

      scene.add.existing(this);
      this.setDepth(200);

      scene.scale.on(
         'resize',
         (gameSize: Phaser.Structs.Size) => {
            this.setPosition(gameSize.width / 2, gameSize.height / 2);
            rectangle.setPosition(0, 0);
         },
         this,
      );
   }
}
