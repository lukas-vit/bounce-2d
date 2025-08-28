import { Difficulty } from "../config/gameConfig";

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
  playerScore: number;
  isPaused: boolean;
  difficulty: Difficulty;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export interface Paddle {
  y: number;
  height: number;
  width: number;
  speed: number;
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  difficulty: Difficulty;
  date: string;
}
