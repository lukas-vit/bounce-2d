import { useState, useEffect, useCallback, useRef } from "react";
import {
  GameState,
  BallState,
  PaddleState,
  TrailPoint,
  Difficulty,
  GameStatus,
} from "../types/game";
import {
  GAME_CONFIG,
  DIFFICULTY_CONFIG,
  createInitialBall,
  createInitialPaddle,
  TrailManager,
  saveToLeaderboard,
} from "../utils/gameUtils";

export const useGame = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.MENU,
    playerPoints: 0,
    aiPoints: 0,
    difficulty: "medium",
    gameStarted: false,
    isPaused: false,
  });

  // Game entities
  const [ball, setBall] = useState<BallState>(() =>
    createInitialBall("medium")
  );
  const [playerPaddle, setPlayerPaddle] = useState<PaddleState>(() =>
    createInitialPaddle(true)
  );
  const [aiPaddle, setAiPaddle] = useState<PaddleState>(() =>
    createInitialPaddle(false)
  );
  const [ballTrail, setBallTrail] = useState<TrailPoint[]>([]);

  // Refs for game loop and state tracking
  const gameLoopRef = useRef<number>();
  const lastHitByPlayerRef = useRef(false);
  const pointScoredRef = useRef(false);

  // Game control functions
  const startGame = useCallback((difficulty: Difficulty) => {
    console.log("Starting game with difficulty:", difficulty);

    setGameState((prev) => ({
      ...prev,
      status: GameStatus.PLAYING,
      gameStarted: true,
      difficulty,
      playerPoints: 0,
      aiPoints: 0,
      isPaused: false,
    }));

    // Reset entities for new game
    const initialBall = createInitialBall(difficulty);
    console.log("Initial ball state:", initialBall);
    setBall(initialBall);
    setPlayerPaddle(createInitialPaddle(true));
    setAiPaddle(createInitialPaddle(false));
    setBallTrail([]);

    // Reset flags
    lastHitByPlayerRef.current = false;
    pointScoredRef.current = false;
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status:
        prev.status === GameStatus.PLAYING
          ? GameStatus.PAUSED
          : GameStatus.PLAYING,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      status: GameStatus.MENU,
      playerPoints: 0,
      aiPoints: 0,
      difficulty: "medium",
      gameStarted: false,
      isPaused: false,
    });

    setBall(createInitialBall("medium"));
    setPlayerPaddle(createInitialPaddle(true));
    setAiPaddle(createInitialPaddle(false));
    setBallTrail([]);

    // Reset trail position to match initial ball position
    TrailManager.resetTrailPosition(
      createInitialBall("medium").x,
      createInitialBall("medium").y
    );

    lastHitByPlayerRef.current = false;
    pointScoredRef.current = false;
  }, []);

  const endGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: GameStatus.GAME_OVER,
      isPaused: false,
    }));
  }, []);

  // Entity update functions
  const updatePlayerPaddle = useCallback((mouseY: number) => {
    setPlayerPaddle((prev) => ({
      ...prev,
      y: Math.max(
        0,
        Math.min(GAME_CONFIG.gameHeight - prev.height, mouseY - prev.height / 2)
      ),
    }));
  }, []);

  const updateAIPaddle = useCallback(() => {
    const config = DIFFICULTY_CONFIG[gameState.difficulty];
    const paddleCenter = aiPaddle.y + aiPaddle.height / 2;
    const targetY = ball.y;
    const diff = targetY - paddleCenter;

    // Add some randomness based on difficulty
    const reaction = config.aiReactionTime;
    const movement = diff * config.aiSpeed * reaction;

    let newY = aiPaddle.y + movement;
    newY = Math.max(
      0,
      Math.min(GAME_CONFIG.gameHeight - aiPaddle.height, newY)
    );

    setAiPaddle((prev) => ({ ...prev, y: newY }));
  }, [aiPaddle, ball, gameState.difficulty]);

  // Main game loop
  const gameLoop = useCallback(() => {
    if (gameState.status !== GameStatus.PLAYING || gameState.isPaused) {
      return;
    }

    // Update AI paddle
    updateAIPaddle();

    // Update ball position and handle collisions inline
    setBall((prevBall) => {
      // Calculate new position
      const newX = prevBall.x + prevBall.dx;
      const newY = prevBall.y + prevBall.dy;

      // Create new ball object
      const newBall = {
        ...prevBall,
        x: newX,
        y: newY,
      };

      // Handle top and bottom boundaries
      if (
        newBall.y <= 0 ||
        newBall.y >= GAME_CONFIG.gameHeight - GAME_CONFIG.ballSize
      ) {
        newBall.dy *= -1;
        newBall.y = Math.max(
          0,
          Math.min(GAME_CONFIG.gameHeight - GAME_CONFIG.ballSize, newBall.y)
        );
      }

      // Handle player paddle collision
      if (
        newBall.x <= GAME_CONFIG.paddleWidth + GAME_CONFIG.ballSize &&
        newBall.y + GAME_CONFIG.ballSize >= playerPaddle.y &&
        newBall.y <= playerPaddle.y + playerPaddle.height
      ) {
        newBall.dx = Math.abs(newBall.dx);
        const hitPos =
          (newBall.y + GAME_CONFIG.ballSize / 2 - playerPaddle.y) /
            playerPaddle.height -
          0.5;
        newBall.dy += hitPos * 2;
        newBall.speed *= 1.1;
        lastHitByPlayerRef.current = true;
      }

      // Handle AI paddle collision
      if (
        newBall.x + GAME_CONFIG.ballSize >=
          GAME_CONFIG.gameWidth - GAME_CONFIG.paddleWidth &&
        newBall.y + GAME_CONFIG.ballSize >= aiPaddle.y &&
        newBall.y <= aiPaddle.y + aiPaddle.height
      ) {
        newBall.dx = -Math.abs(newBall.dx);
        const hitPos =
          (newBall.y + GAME_CONFIG.ballSize / 2 - aiPaddle.y) /
            aiPaddle.height -
          0.5;
        newBall.dy += hitPos * 2;
        newBall.speed *= 1.1;
      }

      // Add trail point with the exact same position as the ball
      setBallTrail((prevTrail) =>
        TrailManager.addTrailPoint(prevTrail, newBall.x, newBall.y)
      );

      // Check for scoring
      if (newBall.x < 0) {
        // Ball went off left side - Player missed, game over
        setGameState((prev) => ({
          ...prev,
          status: GameStatus.GAME_OVER,
        }));
        return prevBall; // Don't update ball position yet
      } else if (newBall.x > GAME_CONFIG.gameWidth) {
        // Ball went off right side - Player scores
        setGameState((prev) => {
          const newPlayerPoints = prev.playerPoints + 1;
          if (newPlayerPoints >= GAME_CONFIG.maxPoints) {
            saveToLeaderboard(newPlayerPoints, prev.difficulty);
            return {
              ...prev,
              status: GameStatus.GAME_OVER,
              playerPoints: newPlayerPoints,
            };
          }
          return { ...prev, playerPoints: newPlayerPoints };
        });
        setTimeout(() => {
          setBall(createInitialBall(gameState.difficulty, -1));
          setBallTrail([]);
        }, 500);
        return prevBall; // Don't update ball position yet
      }

      return newBall;
    });

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameState.status,
    gameState.isPaused,
    updateAIPaddle,
    playerPaddle,
    aiPaddle,
    gameState.difficulty,
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
    // State
    gameState,
    ball,
    playerPaddle,
    aiPaddle,
    ballTrail,

    // Actions
    startGame,
    pauseGame,
    resetGame,
    endGame,
    updatePlayerPaddle,
  };
};
