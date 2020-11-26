export enum GamePhase {
   PLAYING,
   FINISHED,
}

export interface GameState {
   moonPercentage: number;
   phase: GamePhase;
}
