import * as Phaser from 'phaser';

interface ScoreBoardOptions {
   readonly scene: Phaser.Scene;
}

export class ScoreBoard extends Phaser.GameObjects.Container {
   constructor(private readonly options: ScoreBoardOptions) {
      super(options.scene, 100, 70);

      const firstPlayer = new Phaser.GameObjects.Text(options.scene, 0, 0, 'Player 1', {
         color: '#FFF',
         fontSize: '20px',
      });
      this.add(firstPlayer);

      const secondPlayer = new Phaser.GameObjects.Text(options.scene, 0, 30, 'Player 2', {
         color: '#FFF',
         fontSize: '20px',
      });
      this.add(secondPlayer);

      const thirdPlayer = new Phaser.GameObjects.Text(options.scene, 0, 60, 'Player 3', {
         color: '#FFF',
         fontSize: '20px',
      });
      this.add(thirdPlayer);

      this.setScrollFactor(0, 0);
      this.setDepth(300);

      options.scene.add.existing(this);
   }
}
