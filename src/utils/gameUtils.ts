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

/**
 * Creates a new ball with initial position and velocity
 * @returns A new Ball object positioned at the center of the game board
 */
export const createBall = (): Ball => {
  const dimensions = getGameDimensions();
  const ballPhysics = getBallPhysicsConstants();
  const initialX = dimensions.width / 2;
  const initialY = dimensions.height / 2;

  return {
    x: initialX,
    y: initialY,
    vx: dimensions.initialBallSpeed,
    vy: (Math.random() - 0.5) * ballPhysics.randomVelocityRange,
    size: dimensions.ballSize,
    particles: [],
    lastParticleSpawn: 0,
  };
};

/**
 * Creates a new paddle with initial position and properties
 * @param isPlayer - Whether this paddle is for the player (true) or AI (false)
 * @returns A new Paddle object positioned at the center of the game board
 */
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

/**
 * Checks collision between a ball and paddle with tolerance for better user experience
 * @param ball - The ball object to check collision for
 * @param paddle - The paddle object to check collision against
 * @param paddleX - The X coordinate of the paddle
 * @returns True if collision detected, false otherwise
 */
export const checkPaddleCollision = (
  ball: Ball,
  paddle: Paddle,
  paddleX: number
): boolean => {
  const ballLeft = ball.x - ball.size / 2;
  const ballRight = ball.x + ball.size / 2;
  const ballTop = ball.y - ball.size / 2;
  const ballBottom = ball.y + ball.size / 2;

  const paddleLeft = paddleX;
  const paddleRight = paddleX + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  const tolerance = 5;

  return (
    ballRight + tolerance >= paddleLeft &&
    ballLeft - tolerance <= paddleRight &&
    ballBottom + tolerance >= paddleTop &&
    ballTop - tolerance <= paddleBottom
  );
};

/**
 * Checks if the ball collides with the top or bottom walls
 * @param ball - The ball object to check
 * @returns True if wall collision detected, false otherwise
 */
export const checkWallCollision = (ball: Ball): boolean => {
  const dimensions = getGameDimensions();
  return ball.y <= 0 || ball.y + ball.size >= dimensions.height;
};

/**
 * Determines which player scored based on ball position
 * @param ball - The ball object to check
 * @returns "player" if AI missed, "ai" if player missed, null if no scoring
 */
export const checkScoring = (ball: Ball): "player" | "ai" | null => {
  const dimensions = getGameDimensions();
  if (ball.x <= 0) return "ai";
  if (ball.x >= dimensions.width) return "player";
  return null;
};

/**
 * Updates AI paddle position to track the ball
 * @param aiPaddle - The current AI paddle state
 * @param ball - The ball object to track
 * @param difficulty - The current game difficulty
 * @returns Updated paddle with new position
 */
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

/**
 * Updates ball position, handles wall collisions, and manages particle effects
 * @param ball - The current ball state
 * @returns Updated ball with new position and particles
 */
export const updateBall = (ball: Ball): Ball => {
  const dimensions = getGameDimensions();

  const newBall = {
    ...ball,
    x: ball.x + ball.vx,
    y: ball.y + ball.vy,
  };

  if (newBall.y <= 0) {
    newBall.vy = Math.abs(newBall.vy);
    newBall.y = 0;
  } else if (newBall.y + newBall.size / 2 >= dimensions.height) {
    newBall.vy = -Math.abs(newBall.vy);
    newBall.y = dimensions.height - newBall.size / 2;
  }

  if (newBall.x < 0) {
    newBall.x = 0;
  } else if (newBall.x > dimensions.width) {
    newBall.x = dimensions.width;
  }

  const currentTime = Date.now();
  const particleSpawnInterval = 60;

  if (currentTime - ball.lastParticleSpawn > particleSpawnInterval) {
    const particleTypes: Array<"sparkle" | "glow" | "trail"> = [
      "sparkle",
      "glow",
      "trail",
    ];
    const randomType =
      particleTypes[Math.floor(Math.random() * particleTypes.length)];

    const particleVx = ball.vx * 0.1 + (Math.random() - 0.5) * 2;
    const particleVy = ball.vy * 0.1 + (Math.random() - 0.5) * 2;

    const newParticle = {
      x: ball.x,
      y: ball.y,
      vx: particleVx,
      vy: particleVy,
      age: 0,
      size: ball.size * (0.3 + Math.random() * 0.4),
      type: randomType,
    };

    const updatedParticles = [newParticle, ...ball.particles.slice(0, 19)];
    newBall.particles = updatedParticles;
    newBall.lastParticleSpawn = currentTime;
  } else {
    newBall.particles = ball.particles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        age: particle.age + 1,
        vy: particle.vy + 0.1,
      }))
      .filter((particle) => {
        const dimensions = getGameDimensions();
        return (
          particle.age < 80 &&
          particle.x > -50 &&
          particle.x < dimensions.width + 50 &&
          particle.y > -50 &&
          particle.y < dimensions.height + 50
        );
      });
  }

  return newBall;
};

/**
 * Saves a player's score to the leaderboard
 * @param score - The player's final score
 * @param difficulty - The difficulty level the game was played on
 */
export const saveToLeaderboard = (
  score: number,
  difficulty: Difficulty
): void => {
  const leaderboard = getLeaderboard();
  const nickname =
    localStorage.getItem(GAME_CONFIG.storage.nickname) || "Anonymous";

  const existingEntryIndex = leaderboard.findIndex(
    (entry) => entry.nickname === nickname && entry.difficulty === difficulty
  );

  const newEntry: LeaderboardEntry = {
    nickname,
    score,
    difficulty,
    date: new Date().toLocaleString(
      GAME_CONFIG.leaderboard.dateFormat.locale,
      GAME_CONFIG.leaderboard.dateFormat.options
    ),
  };

  if (existingEntryIndex !== -1) {
    if (score > leaderboard[existingEntryIndex].score) {
      leaderboard[existingEntryIndex] = newEntry;
    }
  } else {
    leaderboard.push(newEntry);
  }

  leaderboard.sort((a, b) => b.score - a.score);

  const topScores = leaderboard.slice(0, GAME_CONFIG.leaderboard.maxEntries);
  localStorage.setItem(
    GAME_CONFIG.storage.leaderboard,
    JSON.stringify(topScores)
  );
};

/**
 * Retrieves the leaderboard from localStorage
 * @returns Array of leaderboard entries, or empty array if none exist
 */
export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem(GAME_CONFIG.storage.leaderboard);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Clears all leaderboard data from localStorage
 */
export const clearLeaderboard = (): void => {
  localStorage.removeItem(GAME_CONFIG.storage.leaderboard);
};

/**
 * Formats a difficulty level for display
 * @param difficulty - The difficulty level to format
 * @returns The formatted difficulty name
 */
export const formatDifficulty = (difficulty: Difficulty): string => {
  return getDifficultyConfig(difficulty).name;
};

export { getDifficultyColor, getDifficultyDescription, getDifficultyLabel };

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];
