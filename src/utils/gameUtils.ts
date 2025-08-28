import { Ball, LeaderboardEntry, Paddle } from "../types/game";
import {
  GAME_CONFIG,
  getDifficultyConfig,
  Difficulty,
  getDifficultyColor,
  getDifficultyDescription,
  getDifficultyLabel,
  getGameDimensions,
  getPlayerPaddleSpeed,
  getAIMovementSmoothing,
  getBallPhysicsConstants,
} from "../config/gameConfig";

// Factory functions
export const createBall = (): Ball => {
  const dimensions = getGameDimensions();
  const ballPhysics = getBallPhysicsConstants();
  return {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
    vx: dimensions.initialBallSpeed,
    vy: (Math.random() - 0.5) * ballPhysics.randomVelocityRange,
    size: dimensions.ballSize,
  };
};

export const createPaddle = (isPlayer: boolean): Paddle => {
  const dimensions = getGameDimensions();
  const playerSpeed = getPlayerPaddleSpeed();
  const aiSpeed = getDifficultyConfig("medium").aiSpeed;

  return {
    y: dimensions.height / 2 - dimensions.paddleHeight / 2,
    height: dimensions.paddleHeight,
    width: dimensions.paddleWidth,
    speed: isPlayer ? playerSpeed : aiSpeed,
  };
};

// Simple collision detection
export const checkPaddleCollision = (
  ball: Ball,
  paddle: Paddle,
  paddleX: number
): boolean => {
  return (
    ball.x + ball.size >= paddleX &&
    ball.x <= paddleX + paddle.width &&
    ball.y + ball.size >= paddle.y &&
    ball.y <= paddle.y + paddle.height
  );
};

export const checkWallCollision = (ball: Ball): boolean => {
  const dimensions = getGameDimensions();
  return ball.y <= 0 || ball.y + ball.size >= dimensions.height;
};

export const checkScoring = (ball: Ball): "player" | "ai" | null => {
  const dimensions = getGameDimensions();
  if (ball.x <= 0) return "ai";
  if (ball.x >= dimensions.width) return "player";
  return null;
};

// Simple AI movement
export const updateAI = (
  aiPaddle: Paddle,
  ball: Ball,
  difficulty: Difficulty
): Paddle => {
  const config = getDifficultyConfig(difficulty);
  const dimensions = getGameDimensions();
  const smoothing = getAIMovementSmoothing();

  const targetY = ball.y - aiPaddle.height / 2;
  const diff = targetY - aiPaddle.y;
  const movement = diff * smoothing * config.aiSpeed;

  return {
    ...aiPaddle,
    y: Math.max(
      0,
      Math.min(dimensions.height - aiPaddle.height, aiPaddle.y + movement)
    ),
  };
};

// Ball physics (simplified)
export const updateBall = (ball: Ball): Ball => {
  const dimensions = getGameDimensions();

  // Update position
  const newBall = {
    ...ball,
    x: ball.x + ball.vx,
    y: ball.y + ball.vy,
  };

  // Wall bounce
  if (newBall.y <= 0 || newBall.y + newBall.size >= dimensions.height) {
    newBall.vy *= -1;
    newBall.y = Math.max(
      0,
      Math.min(dimensions.height - newBall.size, newBall.y)
    );
  }

  return newBall;
};

// Leaderboard management
export const saveToLeaderboard = (
  score: number,
  difficulty: Difficulty
): void => {
  const leaderboard = getLeaderboard();
  const nickname =
    localStorage.getItem(GAME_CONFIG.storage.nickname) || "Anonymous";

  const newEntry: LeaderboardEntry = {
    nickname,
    score,
    difficulty,
    date: new Date().toLocaleDateString(),
  };

  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score);

  // Keep only top scores
  const topScores = leaderboard.slice(0, GAME_CONFIG.leaderboard.maxEntries);
  localStorage.setItem(
    GAME_CONFIG.storage.leaderboard,
    JSON.stringify(topScores)
  );
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem(GAME_CONFIG.storage.leaderboard);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const clearLeaderboard = (): void => {
  localStorage.removeItem(GAME_CONFIG.storage.leaderboard);
};

// Utility functions
export const formatDifficulty = (difficulty: Difficulty): string => {
  return getDifficultyConfig(difficulty).name;
};

export { getDifficultyColor, getDifficultyDescription, getDifficultyLabel };

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];
