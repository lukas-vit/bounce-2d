// Centralized game configuration
export const GAME_CONFIG = {
  // Game dimensions and physics
  game: {
    width: 800,
    height: 400,
    ballSize: 16,
    paddleWidth: 12,
    paddleHeight: 80,
    initialBallSpeed: 6,
    fps: 60,
    playerPaddleSpeed: 8,
  },

  // Power-up configurations
  powerUps: {
    speed_up: {
      icon: "⚡",
      color: "bg-yellow-400 border-yellow-300",
      name: "Speed Up",
    },
    slow_down: {
      icon: "🐌",
      color: "bg-blue-400 border-blue-300",
      name: "Slow Down",
    },
    paddle_grow: {
      icon: "📏",
      color: "bg-green-400 border-green-300",
      name: "Paddle Grow",
    },
    paddle_shrink: {
      icon: "📐",
      color: "bg-red-400 border-red-300",
      name: "Paddle Shrink",
    },
    extra_life: {
      icon: "❤️",
      color: "bg-pink-400 border-pink-300",
      name: "Extra Life",
    },
  },

  // Difficulty configurations
  difficulties: {
    easy: {
      name: "Easy",
      label: "Beginner",
      description: "Gentle start, slow & steady",
      color: "text-green-400",
      aiSpeed: 3,
      ballSpeedIncrease: 0.8,
      maxBallSpeed: 10,
      difficultyMultiplier: 0.8,
    },
    medium: {
      name: "Medium",
      label: "Normal",
      description: "Balanced challenge, smooth progression",
      color: "text-yellow-400",
      aiSpeed: 4,
      ballSpeedIncrease: 1.2,
      maxBallSpeed: 14,
      difficultyMultiplier: 1.0,
    },
    hard: {
      name: "Hard",
      label: "Challenging",
      description: "Fast-paced, gets wild quickly",
      color: "text-orange-400",
      aiSpeed: 5,
      ballSpeedIncrease: 1.8,
      maxBallSpeed: 18,
      difficultyMultiplier: 1.3,
    },
    expert: {
      name: "Expert",
      label: "Insane",
      description: "Lightning fast, pure chaos!",
      color: "text-red-400",
      aiSpeed: 6,
      ballSpeedIncrease: 2.5,
      maxBallSpeed: 25,
      difficultyMultiplier: 1.6,
    },
  },

  // Game mechanics
  mechanics: {
    aiReactionSpeed: 0.1,
    aiSpeedIncreaseOnHit: 0.3, // 30% of player's increase
    ballTrailEnabled: false,
    maxTrailLength: 18,
    trailSpacing: 8,
    ballSpeedMultiplier: 2, // Multiplier for ball speed changes on paddle hits
    aiMovementSmoothing: 0.1, // AI movement smoothing factor
    ballPhysics: {
      randomVelocityRange: 2, // Range for random ball velocity on creation
      hitPositionMultiplier: 0.5, // Multiplier for ball direction based on hit position
    },
  },

  // Leaderboard settings
  leaderboard: {
    maxEntries: 10,
    dateFormat: {
      locale: "en-US",
      options: {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      },
    },
  },

  // Local storage keys
  storage: {
    nickname: "bounce-nickname",
    leaderboard: "bounce-leaderboard",
  },

  // Game timing
  timing: {
    ballResetDelay: 1000, // ms
    aiUpdateRate: 60, // fps
    gameLoopRate: 60, // fps
  },
} as const;

// Type definitions for the config
export type Difficulty = keyof typeof GAME_CONFIG.difficulties;
export type DifficultyConfig = (typeof GAME_CONFIG.difficulties)[Difficulty];

// Helper functions
export const getDifficultyConfig = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty];
export const getDifficultyColor = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty].color;
export const getDifficultyLabel = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty].label;
export const getDifficultyDescription = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty].description;
export const getDifficultyName = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty].name;
export const getAllDifficulties = (): Difficulty[] =>
  Object.keys(GAME_CONFIG.difficulties) as Difficulty[];

// Game-specific helper functions
export const getGameDimensions = () => ({
  width: GAME_CONFIG.game.width,
  height: GAME_CONFIG.game.height,
  ballSize: GAME_CONFIG.game.ballSize,
  paddleWidth: GAME_CONFIG.game.paddleWidth,
  paddleHeight: GAME_CONFIG.game.paddleHeight,
  initialBallSpeed: GAME_CONFIG.game.initialBallSpeed,
});

export const getPlayerPaddleSpeed = () => GAME_CONFIG.game.playerPaddleSpeed;
export const getAIMovementSmoothing = () =>
  GAME_CONFIG.mechanics.aiMovementSmoothing;
export const getBallResetDelay = () => GAME_CONFIG.timing.ballResetDelay;
export const getBallSpeedMultiplier = () =>
  GAME_CONFIG.mechanics.ballSpeedMultiplier;
export const getAISpeedIncreaseOnHit = () =>
  GAME_CONFIG.mechanics.aiSpeedIncreaseOnHit;
export const getBallPhysicsConstants = () => GAME_CONFIG.mechanics.ballPhysics;

// Power-up helper functions
export const getPowerUpConfig = (type: string) =>
  GAME_CONFIG.powerUps[type as keyof typeof GAME_CONFIG.powerUps];
export const getPowerUpIcon = (type: string) =>
  getPowerUpConfig(type)?.icon || "❓";
export const getPowerUpColor = (type: string) =>
  getPowerUpConfig(type)?.color || "bg-gray-400 border-gray-300";
export const getPowerUpName = (type: string) =>
  getPowerUpConfig(type)?.name || "Unknown";
