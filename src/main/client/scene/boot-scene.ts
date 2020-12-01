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
      const progressBar = this.add.rectangle(0, 0, 0, this.scale.height, 0xebc034);
      progressBar.setOrigin(0, 0);

      const percentText = this.add.text(this.scale.width / 2, this.scale.height / 2, '0%', {
         color: '#FFF',
         fontSize: '50px',
         fontFamily: 'CactusStory',
         stroke: '#000000',
         strokeThickness: 7,
      });
      percentText.setOrigin(0.5, 0.5);

      this.load.on('progress', (progress: number) => {
         progressBar.width = this.scale.width * progress;

         const percent = Math.round(progress * 100);
         percentText.setText(`${percent}%`);
      });

      this.load.on('complete', () => {
         percentText.destroy();
         progressBar.destroy();

         this.scene.start(Keys.MAIN_MENU_SCENE);
      });

      this.cameras.main.setBackgroundColor('#ebd798');

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
      this.load.image(Keys.DOUBLE_BARREL, ClientConfig.ASSET_FOLDER + 'weapons/double-barrel.png');
      this.load.audio(Keys.DOUBLE_BARREL_COLLECT, [ClientConfig.ASSET_FOLDER + 'weapons/double-barrel-collect.ogg']);
      this.load.image(Keys.CHEESE, ClientConfig.ASSET_FOLDER + 'cheese/cheese-unit.png');
      this.load.audio(Keys.CHEESE_DOUBLE_EAT_SOUND, [ClientConfig.ASSET_FOLDER + 'cheese/cheese-double-eat-sound.ogg']);
      this.load.image(Keys.CHEESE_GREEN, ClientConfig.ASSET_FOLDER + 'cheese/cheese-unit-green.png');
      this.load.audio(Keys.CHEESE_GREEN_EAT, [ClientConfig.ASSET_FOLDER + 'cheese/cheese-unit-green-eat.ogg']);
      this.load.image(Keys.CHEESE_BOMB, ClientConfig.ASSET_FOLDER + 'cheese/bomb.png');
      this.load.audio(Keys.CHEESE_BOMB_EXPLOSION, [ClientConfig.ASSET_FOLDER + 'cheese/bomb-explosion.ogg']);
      this.load.image(Keys.CHEESE_GLOW, ClientConfig.ASSET_FOLDER + 'cheese/cheese-unit-glow.png');
      this.load.image(Keys.CHEESE_GREEN_GLOW, ClientConfig.ASSET_FOLDER + 'cheese/cheese-unit-green-glow.png');
      this.load.audio(Keys.CHEESE_EAT_SOUND, [ClientConfig.ASSET_FOLDER + 'cheese/cheese-eat.ogg']);
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
      this.load.audio(Keys.GUN_SOUND_1, [ClientConfig.ASSET_FOLDER + 'weapons/basic-gun1.mp3']);
      this.load.audio(Keys.GUN_SOUND_2, [ClientConfig.ASSET_FOLDER + 'weapons/basic-gun2.mp3']);
      this.load.audio(Keys.GUN_SOUND_3, [ClientConfig.ASSET_FOLDER + 'weapons/basic-gun3.mp3']);
      this.load.audio(Keys.GUN_SOUND_4, [ClientConfig.ASSET_FOLDER + 'weapons/basic-gun4.mp3']);
      this.load.audio(Keys.MOON_AMBIENCE, [ClientConfig.ASSET_FOLDER + 'moon/moon-ambience.ogg']);
      this.load.audio(Keys.MOON_IMPACT, [ClientConfig.ASSET_FOLDER + 'moon/moon-impact.ogg']);
      this.load.audio(Keys.MOON_LAND_SOUND_0, [ClientConfig.ASSET_FOLDER + 'moon/moon-land0.ogg']);
      this.load.audio(Keys.MOON_LAND_SOUND_1, [ClientConfig.ASSET_FOLDER + 'moon/moon-land1.ogg']);
      this.load.audio(Keys.MOON_LAND_SOUND_2, [ClientConfig.ASSET_FOLDER + 'moon/moon-land2.ogg']);
      this.load.audio(Keys.MOON_LAND_SOUND_3, [ClientConfig.ASSET_FOLDER + 'moon/moon-land3.ogg']);
      this.load.audio(Keys.MOON_LAND_SOUND_4, [ClientConfig.ASSET_FOLDER + 'moon/moon-land4.ogg']);
      this.load.audio(Keys.MOON_LAND_SOUND_5, [ClientConfig.ASSET_FOLDER + 'moon/moon-land5.ogg']);
      this.load.audio(Keys.MOON_LAND_SOUND_6, [ClientConfig.ASSET_FOLDER + 'moon/moon-land6.ogg']);
      this.load.audio(Keys.MOON_LAND_SOUND_7, [ClientConfig.ASSET_FOLDER + 'moon/moon-land7.ogg']);
      this.load.audio(Keys.MOON_LAND_SOUND_8, [ClientConfig.ASSET_FOLDER + 'moon/moon-land8.ogg']);
      this.load.image(Keys.MOON_DUST_PARTICLE, ClientConfig.ASSET_FOLDER + 'moon/moon-dust-particle.png');
      this.load.image(Keys.MOON_FULL_HUD, ClientConfig.ASSET_FOLDER + 'moon/moon-full.png');
      this.load.image(Keys.MOON_EMPTY_HUD, ClientConfig.ASSET_FOLDER + 'moon/moon-empty.png');
      this.load.spritesheet(Keys.SMOKE_FIRE, ClientConfig.ASSET_FOLDER + 'smoke-fire.png', {
         frameWidth: 16,
         frameHeight: 16,
         endFrame: 16,
      });
      this.load.image(Keys.LOGO, ClientConfig.ASSET_FOLDER + 'ui/logo.png');
      this.load.atlas(
         Keys.FLARES,
         ClientConfig.ASSET_FOLDER + 'common/flares.png',
         ClientConfig.ASSET_FOLDER + 'common/flares.json',
      );
      this.load.image(Keys.LAVA_SPIT, ClientConfig.ASSET_FOLDER + 'lava/lava-spit.png');
      this.load.image(Keys.SCORE_BOARD, ClientConfig.ASSET_FOLDER + 'ui/game-set-score-board.png');
      this.load.image(Keys.EARTH, ClientConfig.ASSET_FOLDER + 'star-field/earth.png');
      this.load.image(Keys.MOON_LOADING, ClientConfig.ASSET_FOLDER + 'ui/moon-loading.png');
      this.load.image(Keys.ROCKET_LOADING, ClientConfig.ASSET_FOLDER + 'ui/rocket-loading.png');
      this.load.image(Keys.HOW_TO_PLAY_CONTROLS, ClientConfig.ASSET_FOLDER + 'ui/how-to-play-controls.png');
      this.load.image(Keys.INDICATOR_ARROW, ClientConfig.ASSET_FOLDER + 'ui/indicator-arrow.png');
   }
}
