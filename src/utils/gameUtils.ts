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

// Enhanced collision detection with proper ball centering and tolerance
export const checkPaddleCollision = (
  ball: Ball,
  paddle: Paddle,
  paddleX: number
): boolean => {
  // Ball is positioned from its center, so calculate bounds from center
  const ballLeft = ball.x - ball.size / 2;
  const ballRight = ball.x + ball.size / 2;
  const ballTop = ball.y - ball.size / 2;
  const ballBottom = ball.y + ball.size / 2;

  // Paddle bounds
  const paddleLeft = paddleX;
  const paddleRight = paddleX + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  // Generous collision detection with tolerance for better user experience
  const tolerance = 5; // 5px tolerance for reliable collision detection

  return (
    ballRight + tolerance >= paddleLeft &&
    ballLeft - tolerance <= paddleRight &&
    ballBottom + tolerance >= paddleTop &&
    ballTop - tolerance <= paddleBottom
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

  // Wall bounce with better boundary handling
  if (newBall.y <= 0) {
    newBall.vy = Math.abs(newBall.vy); // Ensure positive velocity
    newBall.y = 0;
  } else if (newBall.y + newBall.size / 2 >= dimensions.height) {
    newBall.vy = -Math.abs(newBall.vy); // Ensure negative velocity
    newBall.y = dimensions.height - newBall.size / 2;
  }

  // Ensure ball doesn't get stuck outside horizontal bounds
  if (newBall.x < 0) {
    newBall.x = 0;
  } else if (newBall.x > dimensions.width) {
    newBall.x = dimensions.width;
  }

  // Particle system - create engaging particles at regular intervals
  const currentTime = Date.now();
  const particleSpawnInterval = 60; // Spawn particles every 60ms for smooth effect

  if (currentTime - ball.lastParticleSpawn > particleSpawnInterval) {
    // Create new particles with different types for variety
    const particleTypes: Array<"sparkle" | "glow" | "trail"> = [
      "sparkle",
      "glow",
      "trail",
    ];
    const randomType =
      particleTypes[Math.floor(Math.random() * particleTypes.length)];

    // Add some randomness to particle movement
    const particleVx = ball.vx * 0.1 + (Math.random() - 0.5) * 2;
    const particleVy = ball.vy * 0.1 + (Math.random() - 0.5) * 2;

    const newParticle = {
      x: ball.x,
      y: ball.y,
      vx: particleVx,
      vy: particleVy,
      age: 0,
      size: ball.size * (0.3 + Math.random() * 0.4), // Random size variation
      type: randomType,
    };

    // Add new particle and keep only recent ones for performance
    const updatedParticles = [newParticle, ...ball.particles.slice(0, 19)]; // Keep 20 particles max
    newBall.particles = updatedParticles;
    newBall.lastParticleSpawn = currentTime;
  } else {
    // Update existing particles
    newBall.particles = ball.particles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        age: particle.age + 1,
        // Add gravity effect for more natural movement
        vy: particle.vy + 0.1,
      }))
      .filter((particle) => {
        // Remove particles that are too old or off-screen
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

// Leaderboard management
export const saveToLeaderboard = (
  score: number,
  difficulty: Difficulty
): void => {
  const leaderboard = getLeaderboard();
  const nickname =
    localStorage.getItem(GAME_CONFIG.storage.nickname) || "Anonymous";

  // Check if player already has an entry for this difficulty
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
    // Update existing entry if new score is higher
    if (score > leaderboard[existingEntryIndex].score) {
      leaderboard[existingEntryIndex] = newEntry;
    }
  } else {
    // Add new entry if none exists for this player and difficulty
    leaderboard.push(newEntry);
  }

  // Sort by score (highest first)
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
