import { Difficulty } from "../config/gameConfig";

export enum GameStatus {
  NICKNAME = "nickname",
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
  LEADERBOARD = "leaderboard",
}

export enum PowerUpType {
  SPEED_UP = "speed_up",
  SLOW_DOWN = "slow_down",
  PADDLE_GROW = "paddle_grow",
  PADDLE_SHRINK = "paddle_shrink",
  EXTRA_LIFE = "extra_life",
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  size: number;
  createdAt: number;
  duration: number;
}

export interface GameState {
  status: GameStatus;
  playerScore: number;
  isPaused: boolean;
  difficulty: Difficulty;
  extraLives: number;
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
