import { useState, useEffect, useCallback, useRef } from "react";
import { GameState, Ball, Paddle, GameStatus } from "../types/game";
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
  });

  // Game entities
  const [ball, setBall] = useState<Ball>(createBall());
  const [playerPaddle, setPlayerPaddle] = useState<Paddle>(createPaddle(true));
  const [aiPaddle, setAiPaddle] = useState<Paddle>(createPaddle(false));

  // Game loop ref
  const gameLoopRef = useRef<number>();

  // Game control functions
  const startGame = useCallback((difficulty: Difficulty) => {
    setGameState({
      status: GameStatus.PLAYING,
      playerScore: 0,
      isPaused: false,
      difficulty,
    });

    setBall(createBall());
    setPlayerPaddle(createPaddle(true));
    setAiPaddle(createPaddle(false));
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
    });

    setBall(createBall());
    setPlayerPaddle(createPaddle(true));
    setAiPaddle(createPaddle(false));
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
      const newBall = updateBall(prevBall, gameState.difficulty);
      const ballPhysics = getBallPhysicsConstants();

      // Check paddle collisions
      if (checkPaddleCollision(newBall, playerPaddle, 0)) {
        // Player paddle hit
        newBall.vx = Math.abs(newBall.vx);
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
        )
      ) {
        // AI paddle hit
        newBall.vx = -Math.abs(newBall.vx);
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

      // Check scoring
      const scoring = checkScoring(newBall);
      if (scoring === "ai") {
        // Game over - player missed
        saveToLeaderboard(gameState.playerScore, gameState.difficulty);
        setGameState((prev) => ({
          ...prev,
          status: GameStatus.GAME_OVER,
        }));
        return prevBall;
      } else if (scoring === "player") {
        // AI missed - reset ball
        setTimeout(() => {
          setBall(createBall());
        }, getBallResetDelay());
        return prevBall;
      }

      return newBall;
    });

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameState.status,
    gameState.isPaused,
    gameState.difficulty,
    gameState.playerScore,
    ball,
    playerPaddle,
    aiPaddle,
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
    startGame,
    pauseGame,
    resetGame,
    endGame,
    updatePlayerPaddle,
    setGameState,
  };
};
