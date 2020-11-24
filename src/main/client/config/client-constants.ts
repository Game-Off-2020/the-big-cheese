export enum Keys {
   // Scenes
   BOOT_SCENE = 'boot-scene',
   MAIN_MENU_SCENE = 'main-menu-scene',
   GAME_SCENE = 'game-scene',
   ERROR_SCENE = 'error-scene',
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
   BASIC_GUN_SOUND = 'basic-gun-sound',
   MOON_DUST_PARTICLE = 'moon-dust-particle',
   MOON_AMBIENCE = 'moon-ambience',
   MOON_IMPACT = 'moon-impact',
   SMOKE_FIRE = 'smoke-fire',
   TERRAIN = 'terrain',
   LAVA = 'lava',
   STAR_FIELD = 'star-field',
   CHEESE = 'cheese',
   // UI
   LOGO = 'logo',
}

export interface PlayerSpriteSheetConfig {
   readonly spriteSheet: string;
   readonly walkAnimation: string;
}
