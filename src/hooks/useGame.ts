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

/**
 * Custom hook that manages the complete game state and logic
 * @returns Object containing game state, entities, and control functions
 */
export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.MENU,
    playerScore: 0,
    isPaused: false,
    difficulty: "medium",
    extraLives: 0,
  });

  const [extraLifeConsumed, setExtraLifeConsumed] = useState(false);

  const [ball, setBall] = useState<Ball>(createBall());
  const [playerPaddle, setPlayerPaddle] = useState<Paddle>(createPaddle(true));
  const [aiPaddle, setAiPaddle] = useState<Paddle>(createPaddle(false));
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([]);

  const gameLoopRef = useRef<number>();
  const activePowerUpsRef = useRef<PowerUp[]>([]);

  /**
   * Spawns a new power-up on the game board
   * Only spawns if no power-up currently exists
   */
  const spawnPowerUp = useCallback(() => {
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
      duration: 15000,
    };

    setPowerUps((prev) => [...prev, newPowerUp]);

    setTimeout(() => {
      setPowerUps((prev) => prev.filter((pu) => pu.id !== newPowerUp.id));
    }, newPowerUp.duration);
  }, [powerUps.length]);

  /**
   * Collects a power-up and applies its effects
   * @param powerUp - The power-up to collect
   */
  const collectPowerUp = useCallback((powerUp: PowerUp) => {
    const isAlreadyActive = activePowerUpsRef.current.some(
      (ap) => ap.id === `active_${powerUp.id}`
    );
    if (isAlreadyActive) {
      return;
    }

    switch (powerUp.type) {
      case PowerUpType.SPEED_UP: {
        setBall((prev) => ({
          ...prev,
          vx: prev.vx * 1.5,
          vy: prev.vy * 1.5,
        }));
        const speedUpActive: PowerUp = {
          ...powerUp,
          id: `active_${powerUp.id}`,
          duration: 10000,
          createdAt: Date.now(),
        };
        setActivePowerUps((prev) => {
          const newActive = [...prev, speedUpActive];
          activePowerUpsRef.current = newActive;
          return newActive;
        });
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
        const slowDownActive: PowerUp = {
          ...powerUp,
          id: `active_${powerUp.id}`,
          duration: 10000,
          createdAt: Date.now(),
        };
        setActivePowerUps((prev) => {
          const newActive = [...prev, slowDownActive];
          activePowerUpsRef.current = newActive;
          return newActive;
        });
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
        const paddleGrowActive: PowerUp = {
          ...powerUp,
          id: `active_${powerUp.id}`,
          duration: 15000,
          createdAt: Date.now(),
        };
        setActivePowerUps((prev) => {
          const newActive = [...prev, paddleGrowActive];
          activePowerUpsRef.current = newActive;
          return newActive;
        });
        setTimeout(() => {
          setActivePowerUps((prev) => {
            const newActive = prev.filter(
              (pu) => pu.id !== paddleGrowActive.id
            );
            activePowerUpsRef.current = newActive;
            return newActive;
          });
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
        const paddleShrinkActive: PowerUp = {
          ...powerUp,
          id: `active_${powerUp.id}`,
          duration: 15000,
          createdAt: Date.now(),
        };
        setActivePowerUps((prev) => {
          const newActive = [...prev, paddleShrinkActive];
          activePowerUpsRef.current = newActive;
          return newActive;
        });
        setTimeout(() => {
          setActivePowerUps((prev) => {
            const newActive = prev.filter(
              (pu) => pu.id !== paddleShrinkActive.id
            );
            activePowerUpsRef.current = newActive;
            return newActive;
          });
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
        // Slow down the ball when collecting extra life to help player catch it
        setBall((prev) => ({
          ...prev,
          vx: prev.vx * 0.8,
          vy: prev.vy * 0.8,
        }));
        break;
    }

    setPowerUps((prev) => prev.filter((pu) => pu.id !== powerUp.id));
  }, []);

  /**
   * Checks if the ball collides with a power-up
   * @param ball - The ball object
   * @param powerUp - The power-up object
   * @returns True if collision detected
   */
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

  /**
   * Starts a new game with the specified difficulty
   * @param difficulty - The difficulty level for the new game
   */
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

  /**
   * Toggles the game pause state
   */
  const pauseGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  /**
   * Resets the game to the initial menu state
   */
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

  /**
   * Ends the current game and transitions to game over state
   */
  const endGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: GameStatus.GAME_OVER,
    }));
  }, []);

  /**
   * Resets the extra life consumed flag
   */
  const resetExtraLifeConsumed = useCallback(() => {
    setExtraLifeConsumed(false);
  }, []);

  /**
   * Updates the player paddle position based on mouse movement
   * @param mouseY - The Y coordinate of the mouse
   */
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

  /**
   * Main game loop that updates game entities and handles collisions
   */
  const gameLoop = useCallback(() => {
    if (gameState.status !== GameStatus.PLAYING || gameState.isPaused) {
      return;
    }

    setAiPaddle((prev) => updateAI(prev, ball, gameState.difficulty));

    setBall((prevBall) => {
      const newBall = updateBall(prevBall);
      const ballPhysics = getBallPhysicsConstants();

      if (checkPaddleCollision(newBall, playerPaddle, 0)) {
        newBall.vx = Math.abs(newBall.vx);

        if (newBall.x < 0) {
          newBall.x = 0;
        }

        const hitPos =
          (newBall.y + newBall.size / 2 - playerPaddle.y) /
            playerPaddle.height -
          ballPhysics.hitPositionMultiplier;
        newBall.vy += hitPos * getBallSpeedMultiplier();

        const newScore = gameState.playerScore + 1;
        setGameState((prev) => ({
          ...prev,
          playerScore: newScore,
        }));

        if (newScore === 2 || (newScore > 2 && (newScore - 2) % 5 === 0)) {
          spawnPowerUp();
        }

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
        )
      ) {
        newBall.vx = -Math.abs(newBall.vx);

        if (newBall.x > getGameDimensions().width) {
          newBall.x = getGameDimensions().width;
        }

        const hitPos =
          (newBall.y + newBall.size / 2 - aiPaddle.y) / aiPaddle.height -
          ballPhysics.hitPositionMultiplier;
        newBall.vy += hitPos * getBallSpeedMultiplier();

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

      const scoring = checkScoring(newBall);

      if (scoring === "ai") {
        if (gameState.extraLives > 0) {
          setGameState((prev) => ({
            ...prev,
            extraLives: prev.extraLives - 1,
          }));

          setExtraLifeConsumed(true);

          newBall.x = getGameDimensions().width / 2;
          newBall.y = getGameDimensions().height / 2;
          // Slow down the ball when using extra life to give player a better chance
          newBall.vx = -Math.abs(newBall.vx) * 0.7;
          newBall.vy = (Math.random() - 0.5) * 4 * 0.7;
        } else {
          if (gameState.status !== GameStatus.GAME_OVER) {
            saveToLeaderboard(gameState.playerScore, gameState.difficulty);
            setGameState((prev) => ({
              ...prev,
              status: GameStatus.GAME_OVER,
            }));
          }
        }
      } else if (scoring === "player") {
        setTimeout(() => {
          setBall(createBall());
        }, getBallResetDelay());
      }

      powerUps.forEach((powerUp) => {
        if (checkPowerUpCollision(newBall, powerUp)) {
          collectPowerUp(powerUp);
        }
      });

      return newBall;
    });

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
    extraLifeConsumed,
    startGame,
    pauseGame,
    resetGame,
    endGame,
    updatePlayerPaddle,
    setGameState,
    resetExtraLifeConsumed,
  };
};
