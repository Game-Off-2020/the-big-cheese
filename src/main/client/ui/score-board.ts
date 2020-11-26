import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { PlayerScore } from '../player/scoreboard/scoreboard-model';
import { ClientConfig } from '../config/client-config';

interface ScoreBoardOptions {
   readonly scene: Phaser.Scene;
}

export class ScoreBoard extends Phaser.GameObjects.Container {
   private readonly scoreLines: PlayerScoreLine[] = [];

   constructor(private readonly options: ScoreBoardOptions) {
      super(options.scene, 35, 170);

      for (let i = 0; i < ClientConfig.SCOREBOARD_SIZE; i++) {
         this.scoreLines.push(new PlayerScoreLine(options.scene, i));
      }
      this.add(this.scoreLines);

      this.setScrollFactor(0, 0);
      this.setDepth(300);

      options.scene.add.existing(this);
   }

   setScoreboard(scoreboard: PlayerScore[]): void {
      // It will hide the scoreboard when only one player is in the room
      const scores = scoreboard.length > 1 ? Math.min(ClientConfig.SCOREBOARD_SIZE, scoreboard.length) : 0;
      for (let i = 0; i < scores; i++) {
         this.scoreLines[i].setScore(scoreboard[i].name, scoreboard[i].count);
         this.scoreLines[i].setVisible(true);
      }
      for (let i = scores; i < ClientConfig.SCOREBOARD_SIZE; i++) {
         this.scoreLines[i].setVisible(false);
      }
   }
}

class PlayerScoreLine extends Phaser.GameObjects.Container {
   private readonly text: Phaser.GameObjects.Text;

   constructor(protected readonly scene: Scene, protected readonly i: number) {
      super(scene, 0, 30 * i);
      this.add(
         (this.text = new Phaser.GameObjects.Text(scene, 0, 0, '', {
            color: '#FFF',
            fontSize: '20px',
         })),
      );
      scene.add.existing(this);
   }

   setScore(playerName: string, cheeseCount: number): void {
      let countText = cheeseCount.toString();
      while (countText.length < 3) {
         countText = ' ' + countText;
      }
      this.text.setText(`${countText} | ${playerName}`);
   }
}
