import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { GunSprite } from './gun-sprite';
import { Player } from '../../shared/player/player-model';

export class OtherPlayerSprite extends Phaser.GameObjects.Container {
   private readonly gun: GunSprite;
   private readonly character: Phaser.GameObjects.Sprite;
   private readonly key: string;

   constructor(protected readonly scene: Scene, private player: Player) {
      super(scene, 0, 0);
      this.key = 'player-' + player.id;
      const config = {
         key: `${this.key}-walk`,
         frames: scene.anims.generateFrameNumbers('player1', { frames: [0, 1, 2, 6, 7, 8] }),
         frameRate: 10,
         repeat: -1,
      };
      scene.anims.create(config);

      this.character = scene.make.sprite({ key: 'player1' });
      this.character.play(`${this.key}-walk`);
      this.add(this.character);

      this.gun = new GunSprite({
         scene,
         character: this.character,
         x: 30,
         y: -30,
      });
      this.add(this.gun);

      scene.add.existing(this);

      this.character.setOrigin(0.5, 1); // TODO: Need to move (relative v absolute)
   }

   updatePlayer(player: Player): void {
      this.player = player;
   }

   update(): void {
      // TODO: Update position from interpolation object
      this.character.setPosition(this.player.position.x, this.player.position.y);
      this.gun.update();
   }
}
