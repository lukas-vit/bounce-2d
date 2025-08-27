import {
  BallState,
  Difficulty,
  DifficultyConfig,
  GameConfig,
  LeaderboardEntry,
  PaddleState,
  TrailPoint,
} from "../types/game";

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    aiSpeed: 1.2,
    aiReactionTime: 0.3,
    ballSpeedMultiplier: 2.0,
    speedIncreaseMultiplier: 1.08, // 8% increase per point
  },
  medium: {
    aiSpeed: 1.4,
    aiReactionTime: 0.2,
    ballSpeedMultiplier: 2.5,
    speedIncreaseMultiplier: 1.12, // 12% increase per point
  },
  hard: {
    aiSpeed: 1.6,
    aiReactionTime: 0.15,
    ballSpeedMultiplier: 3.0,
    speedIncreaseMultiplier: 1.16, // 16% increase per point
  },
  expert: {
    aiSpeed: 1.8,
    aiReactionTime: 0.1,
    ballSpeedMultiplier: 3.5,
    speedIncreaseMultiplier: 1.2, // 20% increase per point
  },
};

export const GAME_CONFIG: GameConfig = {
  ballSize: 20,
  paddleWidth: 12,
  paddleHeight: 80,
  gameWidth: 800,
  gameHeight: 400,
  maxPoints: 10,
  fps: 120,
};

// Factory functions for creating game entities
export const createInitialBall = (
  difficulty: Difficulty,
  direction: number = 1
): BallState => {
  const config = DIFFICULTY_CONFIG[difficulty];
  // Ensure minimum speed and make it more reasonable
  const speed = Math.max(2.5, 3 * config.ballSpeedMultiplier);

  return {
    x: GAME_CONFIG.gameWidth / 2,
    y: GAME_CONFIG.gameHeight / 2 + (Math.random() - 0.5) * 100,
    dx: direction * speed, // Always start moving in the specified direction
    dy: (Math.random() - 0.5) * speed * 0.8,
    speed,
    size: GAME_CONFIG.ballSize,
  };
};

export const createInitialPaddle = (isPlayer: boolean): PaddleState => {
  return {
    y: GAME_CONFIG.gameHeight / 2 - GAME_CONFIG.paddleHeight / 2,
    height: GAME_CONFIG.paddleHeight,
    width: GAME_CONFIG.paddleWidth,
    speed: isPlayer ? 8 : 6,
    isPlayer,
  };
};

// Trail manager for ball trail effects
export class TrailManager {
  private static trailId = 0;
  private static lastTrailX = 0;
  private static lastTrailY = 0;

  static addTrailPoint(
    trail: TrailPoint[],
    x: number,
    y: number
  ): TrailPoint[] {
    // Calculate distance from last trail point
    const distance = Math.sqrt(
      Math.pow(x - this.lastTrailX, 2) + Math.pow(y - this.lastTrailY, 2)
    );

    // Only add trail points when ball moves at least 8 pixels to create natural spacing
    if (distance < 8) {
      // Just update existing trail opacities
      return trail
        .map((point, index) => ({
          ...point,
          opacity: Math.max(0.03, 1 - index * 0.06),
        }))
        .filter((point) => point.opacity > 0.03)
        .slice(-18);
    }

    // Update last trail position
    this.lastTrailX = x;
    this.lastTrailY = y;

    // Add new trail point at current position
    const newTrail = [
      ...trail,
      {
        x,
        y,
        opacity: 1,
        id: this.trailId++,
      },
    ];

    // Update opacities for all trail points
    const updatedTrail = newTrail.map((point, index) => ({
      ...point,
      opacity: Math.max(0.03, 1 - index * 0.06),
    }));

    // Filter out trail points that are too transparent and keep optimal length
    return updatedTrail.filter((point) => point.opacity > 0.03).slice(-18);
  }

  static clearTrail(): TrailPoint[] {
    this.lastTrailX = 0;
    this.lastTrailY = 0;
    return [];
  }

  static resetTrailPosition(x: number, y: number): void {
    this.lastTrailX = x;
    this.lastTrailY = y;
  }
}

// Physics engine for game mechanics
export class PhysicsEngine {
  static updateBallPosition(ball: BallState): BallState {
    // Calculate new position based on current velocity
    const newX = ball.x + ball.dx;
    const newY = ball.y + ball.dy;

    // Ensure minimum velocity to prevent ball from stopping
    let newDx = ball.dx;
    let newDy = ball.dy;

    // If velocity is too small, give it a push
    const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);

    if (currentSpeed < 3) {
      newDx = ball.speed * (ball.dx >= 0 ? 1 : -1);
      newDy = ball.speed * (Math.random() - 0.5) * 0.6;
    }

    const result = {
      ...ball,
      x: newX,
      y: newY,
      dx: newDx,
      dy: newDy,
    };

    return result;
  }

  static updateAIPaddle(
    aiPaddle: PaddleState,
    ball: BallState,
    difficulty: Difficulty
  ): PaddleState {
    const config = DIFFICULTY_CONFIG[difficulty];
    const paddleCenter = aiPaddle.y + aiPaddle.height / 2;
    const targetY = ball.y;
    const diff = targetY - paddleCenter;

    // Add randomness based on difficulty
    const reaction = config.aiReactionTime;
    const movement = diff * config.aiSpeed * reaction;

    let newY = aiPaddle.y + movement;
    newY = Math.max(
      0,
      Math.min(GAME_CONFIG.gameHeight - aiPaddle.height, newY)
    );

    return { ...aiPaddle, y: newY };
  }

  static checkCollisions(
    ball: BallState,
    playerPaddle: PaddleState,
    aiPaddle: PaddleState
  ): {
    ball: BallState;
    playerScored: boolean;
    aiScored: boolean;
    gameOver: boolean;
  } {
    const newBall = { ...ball };
    let playerScored = false;
    let aiScored = false;
    let gameOver = false;

    // Top and bottom boundaries
    if (ball.y <= 0 || ball.y >= GAME_CONFIG.gameHeight - ball.size) {
      newBall.dy *= -1;
      newBall.y = Math.max(
        0,
        Math.min(GAME_CONFIG.gameHeight - ball.size, ball.y)
      );
    }

    // Player paddle collision
    if (
      ball.x <= GAME_CONFIG.paddleWidth + ball.size &&
      ball.y + ball.size >= playerPaddle.y &&
      ball.y <= playerPaddle.y + playerPaddle.height
    ) {
      newBall.dx = Math.abs(newBall.dx);
      const hitPos =
        (ball.y + ball.size / 2 - playerPaddle.y) / playerPaddle.height - 0.5;
      newBall.dy += hitPos * 2;
      newBall.speed *= 1.1;
      playerScored = true;
    }

    // AI paddle collision
    if (
      ball.x + ball.size >= GAME_CONFIG.gameWidth - GAME_CONFIG.paddleWidth &&
      ball.y + ball.size >= aiPaddle.y &&
      ball.y <= aiPaddle.y + aiPaddle.height
    ) {
      newBall.dx = -Math.abs(newBall.dx);
      const hitPos =
        (ball.y + ball.size / 2 - aiPaddle.y) / aiPaddle.height - 0.5;
      newBall.dy += hitPos * 2;
      newBall.speed *= 1.1;
      aiScored = true;
    }

    // Check for game over conditions
    if (ball.x < -ball.size) {
      gameOver = true; // Player missed
    } else if (ball.x > GAME_CONFIG.gameWidth + ball.size) {
      // AI missed, ball will reset
    }

    return { ball: newBall, playerScored, aiScored, gameOver };
  }
}

// Leaderboard management
export const saveToLeaderboard = (
  score: number,
  difficulty: Difficulty
): void => {
  const leaderboard = getLeaderboard();
  const nickname = localStorage.getItem("bounce-nickname") || "Anonymous";
  const newEntry: LeaderboardEntry = {
    nickname,
    score,
    difficulty,
    date: new Date().toLocaleDateString(),
    timestamp: Date.now(),
  };

  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score);
  const finalLeaderboard = leaderboard.slice(0, 10);

  localStorage.setItem("bounce-leaderboard", JSON.stringify(finalLeaderboard));
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  const stored = localStorage.getItem("bounce-leaderboard");
  if (!stored) return [];

  try {
    const leaderboard = JSON.parse(stored);

    // Migrate old entries that don't have nicknames
    const migratedLeaderboard = leaderboard.map(
      (entry: Partial<LeaderboardEntry>) => {
        if (!entry.nickname) {
          return {
            ...entry,
            nickname: "Anonymous",
          } as LeaderboardEntry;
        }
        return entry as LeaderboardEntry;
      }
    );

    // Save migrated data back to localStorage
    if (JSON.stringify(leaderboard) !== JSON.stringify(migratedLeaderboard)) {
      localStorage.setItem(
        "bounce-leaderboard",
        JSON.stringify(migratedLeaderboard)
      );
    }

    return migratedLeaderboard;
  } catch (error) {
    console.error("Error parsing leaderboard:", error);
    return [];
  }
};

export const clearLeaderboard = (): void => {
  localStorage.removeItem("bounce-leaderboard");
};

// Utility functions
export const getDifficultyColor = (difficulty: Difficulty): string => {
  const colors: Record<Difficulty, string> = {
    easy: "text-green-400",
    medium: "text-yellow-400",
    hard: "text-orange-400",
    expert: "text-red-400",
  };
  return colors[difficulty] || "text-white";
};

export const formatDifficulty = (difficulty: Difficulty): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
