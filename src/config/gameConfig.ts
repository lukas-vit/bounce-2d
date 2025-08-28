/**
 * Centralized game configuration containing all game parameters, difficulty settings,
 * power-up configurations, and helper functions.
 */
export const GAME_CONFIG = {
  game: {
    width: 800,
    height: 400,
    ballSize: 16,
    paddleWidth: 12,
    paddleHeight: 80,
    initialBallSpeed: 10,
    fps: 60,
    playerPaddleSpeed: 8,
  },

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

  difficulties: {
    easy: {
      name: "Easy",
      label: "Beginner",
      description: "Gentle start, slow & steady",
      color: "text-green-400",
      aiSpeed: 3,
      ballSpeedIncrease: 1.2,
      maxBallSpeed: 16,
      difficultyMultiplier: 0.8,
    },
    medium: {
      name: "Medium",
      label: "Normal",
      description: "Balanced challenge, smooth progression",
      color: "text-yellow-400",
      aiSpeed: 4,
      ballSpeedIncrease: 1.6,
      maxBallSpeed: 20,
      difficultyMultiplier: 1.0,
    },
    hard: {
      name: "Hard",
      label: "Challenging",
      description: "Fast-paced, gets wild quickly",
      color: "text-orange-400",
      aiSpeed: 5,
      ballSpeedIncrease: 2.2,
      maxBallSpeed: 24,
      difficultyMultiplier: 1.3,
    },
    expert: {
      name: "Expert",
      label: "Insane",
      description: "Lightning fast, pure chaos!",
      color: "text-red-400",
      aiSpeed: 6,
      ballSpeedIncrease: 3.0,
      maxBallSpeed: 32,
      difficultyMultiplier: 1.6,
    },
  },

  mechanics: {
    aiReactionSpeed: 0.1,
    aiSpeedIncreaseOnHit: 0.3,
    ballTrailEnabled: false,
    maxTrailLength: 18,
    trailSpacing: 8,
    ballSpeedMultiplier: 2,
    aiMovementSmoothing: 0.1,
    ballPhysics: {
      randomVelocityRange: 2,
      hitPositionMultiplier: 0.5,
    },
  },

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

  storage: {
    nickname: "bounce-nickname",
    leaderboard: "bounce-leaderboard",
  },

  timing: {
    ballResetDelay: 1000,
    aiUpdateRate: 60,
    gameLoopRate: 60,
  },
} as const;

// Type definitions for the config
export type Difficulty = keyof typeof GAME_CONFIG.difficulties;
export type DifficultyConfig = (typeof GAME_CONFIG.difficulties)[Difficulty];

/**
 * Gets the configuration object for a specific difficulty level
 * @param difficulty - The difficulty level to get configuration for
 * @returns The difficulty configuration object
 */
export const getDifficultyConfig = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty];

/**
 * Gets the color class for a difficulty level
 * @param difficulty - The difficulty level
 * @returns The Tailwind CSS color class
 */
export const getDifficultyColor = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty].color;

/**
 * Gets the label for a difficulty level
 * @param difficulty - The difficulty level
 * @returns The difficulty label
 */
export const getDifficultyLabel = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty].label;

/**
 * Gets the description for a difficulty level
 * @param difficulty - The difficulty level
 * @returns The difficulty description
 */
export const getDifficultyDescription = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty].description;

/**
 * Gets the name for a difficulty level
 * @param difficulty - The difficulty level
 * @returns The difficulty name
 */
export const getDifficultyName = (difficulty: Difficulty) =>
  GAME_CONFIG.difficulties[difficulty].name;

/**
 * Gets all available difficulty levels
 * @returns Array of all difficulty levels
 */
export const getAllDifficulties = (): Difficulty[] =>
  Object.keys(GAME_CONFIG.difficulties) as Difficulty[];

/**
 * Gets the game dimensions and physics constants
 * @returns Object containing game dimensions and physics values
 */
export const getGameDimensions = () => ({
  width: GAME_CONFIG.game.width,
  height: GAME_CONFIG.game.height,
  ballSize: GAME_CONFIG.game.ballSize,
  paddleWidth: GAME_CONFIG.game.paddleWidth,
  paddleHeight: GAME_CONFIG.game.paddleHeight,
  initialBallSpeed: GAME_CONFIG.game.initialBallSpeed,
});

/**
 * Gets the player paddle movement speed
 * @returns The player paddle speed value
 */
export const getPlayerPaddleSpeed = () => GAME_CONFIG.game.playerPaddleSpeed;

/**
 * Gets the AI movement smoothing factor
 * @returns The AI movement smoothing value
 */
export const getAIMovementSmoothing = () =>
  GAME_CONFIG.mechanics.aiMovementSmoothing;

/**
 * Gets the ball reset delay in milliseconds
 * @returns The ball reset delay value
 */
export const getBallResetDelay = () => GAME_CONFIG.timing.ballResetDelay;

/**
 * Gets the ball speed multiplier for paddle hits
 * @returns The ball speed multiplier value
 */
export const getBallSpeedMultiplier = () =>
  GAME_CONFIG.mechanics.ballSpeedMultiplier;

/**
 * Gets the AI speed increase factor when hitting the ball
 * @returns The AI speed increase value
 */
export const getAISpeedIncreaseOnHit = () =>
  GAME_CONFIG.mechanics.aiSpeedIncreaseOnHit;

/**
 * Gets the ball physics constants
 * @returns Object containing ball physics parameters
 */
export const getBallPhysicsConstants = () => GAME_CONFIG.mechanics.ballPhysics;

/**
 * Gets the configuration for a specific power-up type
 * @param type - The power-up type identifier
 * @returns The power-up configuration object or undefined if not found
 */
export const getPowerUpConfig = (type: string) =>
  GAME_CONFIG.powerUps[type as keyof typeof GAME_CONFIG.powerUps];

/**
 * Gets the icon for a power-up type
 * @param type - The power-up type identifier
 * @returns The power-up icon emoji
 */
export const getPowerUpIcon = (type: string) =>
  getPowerUpConfig(type)?.icon || "❓";

/**
 * Gets the color classes for a power-up type
 * @param type - The power-up type identifier
 * @returns The Tailwind CSS color classes
 */
export const getPowerUpColor = (type: string) =>
  getPowerUpConfig(type)?.color || "bg-gray-400 border-gray-300";

/**
 * Gets the display name for a power-up type
 * @param type - The power-up type identifier
 * @returns The power-up display name
 */
export const getPowerUpName = (type: string) =>
  getPowerUpConfig(type)?.name || "Unknown";
