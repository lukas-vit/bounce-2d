export type Difficulty = "easy" | "medium" | "hard" | "expert";

export enum GameStatus {
  NICKNAME = "nickname",
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
  LEADERBOARD = "leaderboard",
}

export interface GameState {
  status: GameStatus;
  playerPoints: number;
  aiPoints: number;
  difficulty: Difficulty;
  gameStarted: boolean;
  isPaused: boolean;
}

export interface BallState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  size: number;
}

export interface PaddleState {
  y: number;
  height: number;
  width: number;
  speed: number;
  isPlayer: boolean;
}

export interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  id: number;
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  difficulty: Difficulty;
  date: string;
  timestamp: number;
}

export interface GameConfig {
  ballSize: number;
  paddleWidth: number;
  paddleHeight: number;
  gameWidth: number;
  gameHeight: number;
  fps: number;
}

export interface DifficultyConfig {
  aiSpeed: number;
  aiReactionTime: number;
  ballSpeedMultiplier: number;
  speedIncreaseMultiplier: number;
  maxSpeed: number;
}

export interface CollisionResult {
  ball: BallState;
  playerScored: boolean;
  aiScored: boolean;
  shouldAwardPoint: boolean;
  gameOver: boolean;
}
