import { SceneUtil } from '../util/scene-util';
import { Scene } from 'phaser';
import { ClientConfig } from '../config/client-config';
import { Keys } from '../config/client-constants';

export class BootScene extends Scene {
   constructor() {
      super({
         active: false,
         visible: false,
         key: Keys.BOOT_SCENE,
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

         const percent = Math.round(progress * 100);
         percentText.setText(`${percent}%`);
      });

      this.load.on('complete', () => {
         loadingText.destroy();
         percentText.destroy();
         assetText.destroy();
         progressBar.destroy();
         progressBarContainer.destroy();

         this.scene.start(Keys.MAIN_MENU_SCENE); // TODO: Extract key
      });

      this.loadAssets();
   }

   /**
    * All assets that need to be loaded by the game (sprites, images, animations, tiles, music, etc)
    * should be added to this method. Once loaded in, the loader will keep track of them, indepedent of which scene
    * is currently active, so they can be accessed anywhere.
    */
   private loadAssets(): void {
      this.load.image(Keys.BULLET, ClientConfig.ASSET_FOLDER + 'weapons/basic-gun-bullet.png');
      this.load.image(Keys.MOON, ClientConfig.ASSET_FOLDER + 'moon/moon-texture.png');
      this.load.image(Keys.BASIC_GUN, ClientConfig.ASSET_FOLDER + 'weapons/basic-gun.png');
      this.load.image(Keys.CHEESE, ClientConfig.ASSET_FOLDER + 'weapons/basic-gun.png');
      this.load.spritesheet(Keys.PLAYER_1, ClientConfig.ASSET_FOLDER + 'players/p1-spritesheet.png', {
         frameWidth: 73,
         frameHeight: 97,
         endFrame: 16,
      });
      this.load.spritesheet(Keys.PLAYER_2, ClientConfig.ASSET_FOLDER + 'players/p2-spritesheet.png', {
         frameWidth: 71,
         frameHeight: 95,
         endFrame: 16,
      });
      this.load.spritesheet(Keys.PLAYER_3, ClientConfig.ASSET_FOLDER + 'players/p3-spritesheet.png', {
         frameWidth: 73,
         frameHeight: 97,
         endFrame: 16,
      });
      this.load.audio(Keys.BASIC_GUN_SOUND, [ClientConfig.ASSET_FOLDER + 'weapons/basic-gun.ogg']);
      this.load.audio(Keys.MOON_AMBIENCE, [ClientConfig.ASSET_FOLDER + 'moon/moon-ambience.ogg']);
      this.load.audio(Keys.MOON_IMPACT, [ClientConfig.ASSET_FOLDER + 'moon/moon-impact.ogg']);

      this.load.image(Keys.MOON_DUST_PARTICLE, ClientConfig.ASSET_FOLDER + 'moon/moon-dust-particle.png');
      this.load.spritesheet(Keys.SMOKE_FIRE, ClientConfig.ASSET_FOLDER + 'smoke-fire.png', {
         frameWidth: 16,
         frameHeight: 16,
         endFrame: 16,
      });
      this.load.image(Keys.LOGO, ClientConfig.ASSET_FOLDER + 'ui/logo.png');
   }
}
