import { useState, useEffect, useCallback, useRef } from "react";
import {
  GameState,
  Ball,
  Paddle,
  GameStatus,
  PowerUp,
  PowerUpType,
} from "../types/game";
import { Difficulty } from "../config/gameConfig";
import {
  createBall,
  createPaddle,
  checkPaddleCollision,
  checkScoring,
  updateAI,
  updateBall,
  saveToLeaderboard,
} from "../utils/gameUtils";
import {
  getDifficultyConfig,
  getGameDimensions,
  getBallResetDelay,
  getBallSpeedMultiplier,
  getAISpeedIncreaseOnHit,
  getBallPhysicsConstants,
} from "../config/gameConfig";

export const useGame = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.MENU,
    playerScore: 0,
    isPaused: false,
    difficulty: "medium",
    extraLives: 0,
  });

  // Game entities
  const [ball, setBall] = useState<Ball>(createBall());
  const [playerPaddle, setPlayerPaddle] = useState<Paddle>(createPaddle(true));
  const [aiPaddle, setAiPaddle] = useState<Paddle>(createPaddle(false));
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([]);

  // Game loop ref
  const gameLoopRef = useRef<number>();

  // Ref to track active power-ups to avoid stale closures
  const activePowerUpsRef = useRef<PowerUp[]>([]);

  // Power-up management
  const spawnPowerUp = useCallback(() => {
    // Only spawn if no power-up exists
    if (powerUps.length > 0) return;

    const dimensions = getGameDimensions();
    const powerUpTypes = Object.values(PowerUpType);
    const randomType =
      powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

    const newPowerUp: PowerUp = {
      id: Math.random().toString(36).substr(2, 9),
      type: randomType,
      x: Math.random() * (dimensions.width - 100) + 50,
      y: Math.random() * (dimensions.height - 100) + 50,
      size: 32,
      createdAt: Date.now(),
      duration: 15000, // 15 seconds - longer duration for better chance to collect
    };

    setPowerUps((prev) => [...prev, newPowerUp]);

    // Remove power-up after duration
    setTimeout(() => {
      setPowerUps((prev) => prev.filter((pu) => pu.id !== newPowerUp.id));
    }, newPowerUp.duration);
  }, [powerUps.length]);

  const collectPowerUp = useCallback((powerUp: PowerUp) => {
    // Check if this power-up is already being processed to prevent duplicates
    // Use a ref to avoid stale closure issues
    const isAlreadyActive = activePowerUpsRef.current.some(
      (ap) => ap.id === `active_${powerUp.id}`
    );
    if (isAlreadyActive) {
      return;
    }

    // Apply power-up effects
    switch (powerUp.type) {
      case PowerUpType.SPEED_UP: {
        setBall((prev) => ({
          ...prev,
          vx: prev.vx * 1.5,
          vy: prev.vy * 1.5,
        }));
        // Add to active power-ups with duration
        const speedUpActive: PowerUp = {
          ...powerUp,
          id: `active_${powerUp.id}`,
          duration: 10000, // 10 seconds active
          createdAt: Date.now(),
        };
        setActivePowerUps((prev) => {
          const newActive = [...prev, speedUpActive];
          activePowerUpsRef.current = newActive;
          return newActive;
        });
        // Remove after duration
        setTimeout(() => {
          setActivePowerUps((prev) => {
            const newActive = prev.filter((pu) => pu.id !== speedUpActive.id);
            activePowerUpsRef.current = newActive;
            return newActive;
          });
        }, speedUpActive.duration);
        break;
      }
      case PowerUpType.SLOW_DOWN: {
        setBall((prev) => ({
          ...prev,
          vx: prev.vx * 0.7,
          vy: prev.vy * 0.7,
        }));
        // Add to active power-ups with duration
        const slowDownActive: PowerUp = {
          ...powerUp,
          id: `active_${powerUp.id}`,
          duration: 10000, // 10 seconds active
          createdAt: Date.now(),
        };
        setActivePowerUps((prev) => {
          const newActive = [...prev, slowDownActive];
          activePowerUpsRef.current = newActive;
          return newActive;
        });
        // Remove after duration
        setTimeout(() => {
          setActivePowerUps((prev) => {
            const newActive = prev.filter((pu) => pu.id !== slowDownActive.id);
            activePowerUpsRef.current = newActive;
            return newActive;
          });
        }, slowDownActive.duration);
        break;
      }
      case PowerUpType.PADDLE_GROW: {
        setPlayerPaddle((prev) => ({
          ...prev,
          height: Math.min(prev.height * 1.3, 200),
        }));
        // Add to active power-ups with duration
        const paddleGrowActive: PowerUp = {
          ...powerUp,
          id: `active_${powerUp.id}`,
          duration: 15000, // 15 seconds active
          createdAt: Date.now(),
        };
        setActivePowerUps((prev) => {
          const newActive = [...prev, paddleGrowActive];
          activePowerUpsRef.current = newActive;
          return newActive;
        });
        // Remove after duration
        setTimeout(() => {
          setActivePowerUps((prev) => {
            const newActive = prev.filter(
              (pu) => pu.id !== paddleGrowActive.id
            );
            activePowerUpsRef.current = newActive;
            return newActive;
          });
          // Reset paddle size
          setPlayerPaddle((prev) => ({
            ...prev,
            height: getGameDimensions().paddleHeight,
          }));
        }, paddleGrowActive.duration);
        break;
      }
      case PowerUpType.PADDLE_SHRINK: {
        setPlayerPaddle((prev) => ({
          ...prev,
          height: Math.max(prev.height * 0.8, 40),
        }));
        // Add to active power-ups with duration
        const paddleShrinkActive: PowerUp = {
          ...powerUp,
          id: `active_${powerUp.id}`,
          duration: 15000, // 15 seconds active
          createdAt: Date.now(),
        };
        setActivePowerUps((prev) => {
          const newActive = [...prev, paddleShrinkActive];
          activePowerUpsRef.current = newActive;
          return newActive;
        });
        // Remove after duration
        setTimeout(() => {
          setActivePowerUps((prev) => {
            const newActive = prev.filter(
              (pu) => pu.id !== paddleShrinkActive.id
            );
            activePowerUpsRef.current = newActive;
            return newActive;
          });
          // Reset paddle size
          setPlayerPaddle((prev) => ({
            ...prev,
            height: getGameDimensions().paddleHeight,
          }));
        }, paddleShrinkActive.duration);
        break;
      }
      case PowerUpType.EXTRA_LIFE:
        setGameState((prev) => ({
          ...prev,
          extraLives: prev.extraLives + 1,
        }));
        break;
    }

    // Remove collected power-up from board
    setPowerUps((prev) => prev.filter((pu) => pu.id !== powerUp.id));
  }, []);

  const checkPowerUpCollision = useCallback((ball: Ball, powerUp: PowerUp) => {
    const ballLeft = ball.x - ball.size / 2;
    const ballRight = ball.x + ball.size / 2;
    const ballTop = ball.y - ball.size / 2;
    const ballBottom = ball.y + ball.size / 2;

    const powerUpLeft = powerUp.x - powerUp.size / 2;
    const powerUpRight = powerUp.x + powerUp.size / 2;
    const powerUpTop = powerUp.y - powerUp.size / 2;
    const powerUpBottom = powerUp.y + powerUp.size / 2;

    return (
      ballRight > powerUpLeft &&
      ballLeft < powerUpRight &&
      ballBottom > powerUpTop &&
      ballTop < powerUpBottom
    );
  }, []);

  // Game control functions
  const startGame = useCallback((difficulty: Difficulty) => {
    setGameState({
      status: GameStatus.PLAYING,
      playerScore: 0,
      isPaused: false,
      difficulty,
      extraLives: 0,
    });

    setBall(createBall());
    setPlayerPaddle(createPaddle(true));
    setAiPaddle(createPaddle(false));
    setPowerUps([]);
    setActivePowerUps([]);
    activePowerUpsRef.current = [];
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      status: GameStatus.MENU,
      playerScore: 0,
      isPaused: false,
      difficulty: "medium",
      extraLives: 0,
    });

    setBall(createBall());
    setPlayerPaddle(createPaddle(true));
    setAiPaddle(createPaddle(false));
    setPowerUps([]);
    setActivePowerUps([]);
    activePowerUpsRef.current = [];
  }, []);

  const endGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: GameStatus.GAME_OVER,
    }));
  }, []);

  // Update player paddle position
  const updatePlayerPaddle = useCallback((mouseY: number) => {
    const dimensions = getGameDimensions();
    setPlayerPaddle((prev) => ({
      ...prev,
      y: Math.max(
        0,
        Math.min(dimensions.height - prev.height, mouseY - prev.height / 2)
      ),
    }));
  }, []);

  // Main game loop
  const gameLoop = useCallback(() => {
    if (gameState.status !== GameStatus.PLAYING || gameState.isPaused) {
      return;
    }

    // Update AI paddle
    setAiPaddle((prev) => updateAI(prev, ball, gameState.difficulty));

    // Update ball
    setBall((prevBall) => {
      const newBall = updateBall(prevBall);
      const ballPhysics = getBallPhysicsConstants();

      // Check paddle collisions first
      if (
        checkPaddleCollision(newBall, playerPaddle, 0) ||
        checkPaddleCollision(prevBall, playerPaddle, 0)
      ) {
        // Player paddle hit
        newBall.vx = Math.abs(newBall.vx);

        // Ensure the ball doesn't get stuck inside the paddle
        if (newBall.x < 0) {
          newBall.x = 0;
        }

        const hitPos =
          (newBall.y + newBall.size / 2 - playerPaddle.y) /
            playerPaddle.height -
          ballPhysics.hitPositionMultiplier;
        newBall.vy += hitPos * getBallSpeedMultiplier();

        // Award point
        setGameState((prev) => ({
          ...prev,
          playerScore: prev.playerScore + 1,
        }));

        // Spawn power-up every 5 points (but only if none exists)
        if (gameState.playerScore % 5 === 0) {
          spawnPowerUp();
        }

        // Increase ball speed based on difficulty
        const config = getDifficultyConfig(gameState.difficulty);
        const currentSpeed = Math.sqrt(
          newBall.vx * newBall.vx + newBall.vy * newBall.vy
        );
        const newSpeed = Math.min(
          currentSpeed + config.ballSpeedIncrease,
          config.maxBallSpeed
        );
        const speedMultiplier = newSpeed / currentSpeed;

        newBall.vx *= speedMultiplier;
        newBall.vy *= speedMultiplier;
      }

      if (
        checkPaddleCollision(
          newBall,
          aiPaddle,
          getGameDimensions().width - aiPaddle.width
        ) ||
        checkPaddleCollision(
          prevBall,
          aiPaddle,
          getGameDimensions().width - aiPaddle.width
        )
      ) {
        // AI paddle hit
        newBall.vx = -Math.abs(newBall.vx);

        // Ensure the ball doesn't get stuck inside the paddle
        if (newBall.x > getGameDimensions().width) {
          newBall.x = getGameDimensions().width;
        }

        const hitPos =
          (newBall.y + newBall.size / 2 - aiPaddle.y) / aiPaddle.height -
          ballPhysics.hitPositionMultiplier;
        newBall.vy += hitPos * getBallSpeedMultiplier();

        // Small speed increase when AI hits (proportional to difficulty)
        const config = getDifficultyConfig(gameState.difficulty);
        const currentSpeed = Math.sqrt(
          newBall.vx * newBall.vx + newBall.vy * newBall.vy
        );
        const aiSpeedIncrease =
          getAISpeedIncreaseOnHit() * config.ballSpeedIncrease;
        const newSpeed = Math.min(
          currentSpeed + aiSpeedIncrease,
          config.maxBallSpeed
        );
        const speedMultiplier = newSpeed / currentSpeed;

        newBall.vx *= speedMultiplier;
        newBall.vy *= speedMultiplier;
      }

      // Check scoring after paddle collisions
      const scoring = checkScoring(newBall);

      if (scoring === "ai") {
        // Player missed - check for extra lives
        if (gameState.extraLives > 0) {
          // Use extra life
          setGameState((prev) => ({
            ...prev,
            extraLives: prev.extraLives - 1,
          }));

          // With extra life, just reverse the ball direction and continue playing
          // Don't reset position or speed - let the ball continue naturally
          newBall.vx = -Math.abs(newBall.vx); // Reverse direction towards player
        } else {
          // No extra lives - game over
          saveToLeaderboard(gameState.playerScore, gameState.difficulty);
          setGameState((prev) => ({
            ...prev,
            status: GameStatus.GAME_OVER,
          }));
        }
      } else if (scoring === "player") {
        // AI missed - reset ball
        setTimeout(() => {
          setBall(createBall());
        }, getBallResetDelay());
      }

      // Check power-up collisions
      powerUps.forEach((powerUp) => {
        if (checkPowerUpCollision(newBall, powerUp)) {
          collectPowerUp(powerUp);
        }
      });

      return newBall;
    });

    // Continue game loop with controlled timing for better collision detection
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameState.status,
    gameState.isPaused,
    gameState.difficulty,
    gameState.playerScore,
    gameState.extraLives,
    ball,
    playerPaddle,
    aiPaddle,
    powerUps,
    checkPowerUpCollision,
    collectPowerUp,
    spawnPowerUp,
  ]);

  // Game loop effect
  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING && !gameState.isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState.status, gameState.isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return {
    gameState,
    ball,
    playerPaddle,
    aiPaddle,
    powerUps,
    activePowerUps,
    startGame,
    pauseGame,
    resetGame,
    endGame,
    updatePlayerPaddle,
    setGameState,
  };
};
