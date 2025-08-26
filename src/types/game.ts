export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  playerScore: number;
  aiScore: number;
  difficulty: Difficulty;
  gameStarted: boolean;
}

export interface BallState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
}

export interface PaddleState {
  y: number;
  height: number;
  speed: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  id: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface LeaderboardEntry {
  score: number;
  difficulty: Difficulty;
  date: string;
}

export interface GameConfig {
  ballSize: number;
  paddleWidth: number;
  paddleHeight: number;
  gameWidth: number;
  gameHeight: number;
  winningScore: number;
}