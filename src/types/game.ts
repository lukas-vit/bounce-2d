import { Difficulty } from "../config/gameConfig";

/**
 * Represents the current state of the game application
 */
export enum GameStatus {
  NICKNAME = "nickname",
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
  LEADERBOARD = "leaderboard",
}

/**
 * Types of power-ups available in the game
 */
export enum PowerUpType {
  SPEED_UP = "speed_up",
  SLOW_DOWN = "slow_down",
  PADDLE_GROW = "paddle_grow",
  PADDLE_SHRINK = "paddle_shrink",
  EXTRA_LIFE = "extra_life",
}

/**
 * Represents a power-up item that can be collected during gameplay
 */
export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  size: number;
  createdAt: number;
  duration: number;
}

/**
 * Represents the overall state of the game
 */
export interface GameState {
  status: GameStatus;
  playerScore: number;
  isPaused: boolean;
  difficulty: Difficulty;
  extraLives: number;
}

/**
 * Represents the game ball with position, velocity, and particle effects
 */
export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    age: number;
    size: number;
    type: "sparkle" | "glow" | "trail";
  }>;
  lastParticleSpawn: number;
}

/**
 * Represents a paddle (player or AI) with position and dimensions
 */
export interface Paddle {
  y: number;
  height: number;
  width: number;
  speed: number;
}

/**
 * Represents a leaderboard entry with player score and metadata
 */
export interface LeaderboardEntry {
  nickname: string;
  score: number;
  difficulty: Difficulty;
  date: string;
}
