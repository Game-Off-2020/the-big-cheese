import { SceneUtil } from '../util/scene-util';
import { Scene } from 'phaser';
import { ClientConfig } from '../config/client-config';

export class BootScene extends Scene {
   constructor() {
      super({
         active: false,
         visible: false,
         key: 'Boot', // TODO: Extract key
      });
   }

   preload(): void {
      const halfWidth = SceneUtil.getWidth(this) * 0.5;
      const halfHeight = SceneUtil.getHeight(this) * 0.5;

      const progressBarHeight = 100;
      const progressBarWidth = 400;

      const progressBarContainer = this.add.rectangle(
         halfWidth,
         halfHeight,
         progressBarWidth,
         progressBarHeight,
         0x000000,
      );
      const progressBar = this.add.rectangle(
         halfWidth + 20 - progressBarContainer.width * 0.5,
         halfHeight,
         10,
         progressBarHeight - 20,
         0x888888,
      );

      const loadingText = this.add.text(halfWidth - 75, halfHeight - 100, 'Loading...').setFontSize(24);
      const percentText = this.add.text(halfWidth - 25, halfHeight, '0%').setFontSize(24);
      const assetText = this.add.text(halfWidth - 25, halfHeight + 100, '').setFontSize(24);

      this.load.on('progress', (progress: number) => {
         progressBar.width = (progressBarWidth - 30) * progress;

         const percent = progress * 100;
         percentText.setText(`${percent}%`);
      });

      this.load.on('complete', () => {
         loadingText.destroy();
         percentText.destroy();
         assetText.destroy();
         progressBar.destroy();
         progressBarContainer.destroy();

         this.scene.start('MainMenu'); // TODO: Extract key
      });

      this.loadAssets();
   }

   /**
    * All assets that need to be loaded by the game (sprites, images, animations, tiles, music, etc)
    * should be added to this method. Once loaded in, the loader will keep track of them, indepedent of which scene
    * is currently active, so they can be accessed anywhere.
    */
   private loadAssets(): void {
      // TODO: Extract file keys
      this.load.image('bullet', ClientConfig.ASSET_FOLDER + 'weapons/basic-gun-bullet.png');
      this.load.image('moon', ClientConfig.ASSET_FOLDER + 'moon/moon-texture.png');
      this.load.image('basic-gun', ClientConfig.ASSET_FOLDER + 'weapons/basic-gun.png');
      this.load.spritesheet('player1', ClientConfig.ASSET_FOLDER + 'players/p1-spritesheet.png', {
         frameWidth: 73,
         frameHeight: 97,
         endFrame: 16,
      });
      this.load.audio('basic-gun-sound', [ClientConfig.ASSET_FOLDER + 'weapons/basic-gun.ogg']);
      this.load.image('moon-dust-particle', ClientConfig.ASSET_FOLDER + 'moon/moon-dust-particle.png');
   }
}
