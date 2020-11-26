export enum Keys {
   // Scenes
   BOOT_SCENE = 'boot-scene',
   MAIN_MENU_SCENE = 'main-menu-scene',
   GAME_SCENE = 'game-scene',
   ERROR_SCENE = 'error-scene',
   GUI_SCENE = 'gui-scene',
   // Game Objects
   BULLET = 'bullet',
   MOON = 'moon',
   BASIC_GUN = 'basic-gun',
   PLAYER_1 = 'player1',
   PLAYER_1_WALK = 'player1-walk',
   PLAYER_2 = 'player2',
   PLAYER_2_WALK = 'player2-walk',
   PLAYER_3 = 'player3',
   PLAYER_3_WALK = 'player3-walk',
   GUN_SOUND_1 = 'gun-sound-1',
   GUN_SOUND_2 = 'gun-sound-2',
   GUN_SOUND_3 = 'gun-sound-3',
   GUN_SOUND_4 = 'gun-sound-4',
   MOON_DUST_PARTICLE = 'moon-dust-particle',
   MOON_AMBIENCE = 'moon-ambience',
   MOON_IMPACT = 'moon-impact',
   MOON_FULL_HUD = 'moon-full-hud',
   MOON_EMPTY_HUD = 'moon-empty-hud',
   SMOKE_FIRE = 'smoke-fire',
   TERRAIN = 'terrain',
   LAVA = 'lava',
   STAR_FIELD = 'star-field',
   CHEESE = 'cheese',
   CHEESE_EAT_SOUND = 'cheese-eat-sound',
   CHEESE_UNIT = 'cheese-unit',
   // UI
   LOGO = 'logo',
   FLARES = 'flares',
   LAVA_SPIT = 'lava-spit',
}

export interface PlayerSpriteSheetConfig {
   readonly spriteSheet: string;
   readonly walkAnimation: string;
}
