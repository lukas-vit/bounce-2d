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
  const stuckBallCounterRef = useRef(0);
  const lastBallPositionRef = useRef({ x: 0, y: 0 });

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
    stuckBallCounterRef.current = 0;
    lastBallPositionRef.current = { x: initialBall.x, y: initialBall.y };
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
    stuckBallCounterRef.current = 0;
    lastBallPositionRef.current = {
      x: GAME_CONFIG.gameWidth / 2,
      y: GAME_CONFIG.gameHeight / 2,
    };
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

    // Predict where the ball will be when it reaches the AI paddle
    const timeToReachPaddle =
      (GAME_CONFIG.gameWidth - GAME_CONFIG.paddleWidth - ball.x) /
      Math.abs(ball.dx);
    const predictedY = ball.y + ball.dy * timeToReachPaddle;

    // Target the center of the predicted ball position
    const targetY = Math.max(
      GAME_CONFIG.ballSize / 2,
      Math.min(GAME_CONFIG.gameHeight - GAME_CONFIG.ballSize / 2, predictedY)
    );

    const diff = targetY - paddleCenter;

    // Make AI movement more responsive and accurate
    const reaction = Math.min(0.1, config.aiReactionTime); // Faster reaction
    const movement = diff * config.aiSpeed * reaction;

    let newY = aiPaddle.y + movement;
    newY = Math.max(
      0,
      Math.min(GAME_CONFIG.gameHeight - aiPaddle.height, newY)
    );

    // Emergency positioning: if ball is very close and AI might miss, snap to perfect position
    if (ball.x > GAME_CONFIG.gameWidth * 0.7 && Math.abs(diff) > 10) {
      newY = targetY - aiPaddle.height / 2;
      newY = Math.max(
        0,
        Math.min(GAME_CONFIG.gameHeight - aiPaddle.height, newY)
      );
    }

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

      // Check if ball is stuck (not moving)
      const ballMoved =
        Math.abs(prevBall.x - lastBallPositionRef.current.x) > 0.1 ||
        Math.abs(prevBall.y - lastBallPositionRef.current.y) > 0.1;

      if (!ballMoved) {
        stuckBallCounterRef.current++;
        if (stuckBallCounterRef.current > 120) {
          // 2 seconds at 60fps
          console.warn("Ball appears to be stuck, resetting position");
          return createInitialBall(gameState.difficulty, 1);
        }
      } else {
        stuckBallCounterRef.current = 0;
        lastBallPositionRef.current = { x: prevBall.x, y: prevBall.y };
      }

      // Create new ball object
      const newBall = {
        ...prevBall,
        x: newX,
        y: newY,
      };

      // Safety check: ensure velocity components are valid
      if (
        isNaN(newBall.dx) ||
        isNaN(newBall.dy) ||
        newBall.dx === 0 ||
        newBall.dy === 0
      ) {
        console.warn("Invalid ball velocity detected, resetting ball");
        return createInitialBall(gameState.difficulty, 1);
      }

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

        // Ensure the ball doesn't get stuck at boundaries
        if (newBall.y <= 0) {
          newBall.y = 1;
        } else if (newBall.y >= GAME_CONFIG.gameHeight - GAME_CONFIG.ballSize) {
          newBall.y = GAME_CONFIG.gameHeight - GAME_CONFIG.ballSize - 1;
        }
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
        lastHitByPlayerRef.current = true;

        // Award point for successful hit
        setGameState((prev) => ({
          ...prev,
          playerPoints: prev.playerPoints + 1,
        }));

        // Increase ball speed when player scores (based on difficulty)
        const config = DIFFICULTY_CONFIG[gameState.difficulty];
        newBall.speed *= config.speedIncreaseMultiplier;

        // Cap the maximum speed based on difficulty to prevent the game from becoming unplayable
        const maxSpeed = config.maxSpeed;
        newBall.speed = Math.min(newBall.speed, maxSpeed);

        // Update velocity components with the new speed
        newBall.dx = newBall.speed;
        newBall.dy = newBall.dy * (newBall.speed / Math.abs(newBall.dx));

        // Ensure the ball is moving in the right direction
        if (newBall.dx === 0) {
          newBall.dx = newBall.speed;
        }
      }

      // Handle AI paddle collision - make it more forgiving
      if (
        newBall.x + GAME_CONFIG.ballSize >=
          GAME_CONFIG.gameWidth - GAME_CONFIG.paddleWidth - 2 &&
        newBall.y + GAME_CONFIG.ballSize >= aiPaddle.y - 5 &&
        newBall.y <= aiPaddle.y + aiPaddle.height + 5
      ) {
        newBall.dx = -Math.abs(newBall.dx);
        const hitPos =
          (newBall.y + GAME_CONFIG.ballSize / 2 - aiPaddle.y) /
            aiPaddle.height -
          0.5;
        newBall.dy += hitPos * 2;

        // Small speed increase when AI hits (proportional to difficulty)
        const config = DIFFICULTY_CONFIG[gameState.difficulty];
        newBall.speed *= 1 + (config.speedIncreaseMultiplier - 1) * 0.3; // 30% of the difficulty-based increase
      }

      // Add trail point with the exact same position as the ball
      setBallTrail((prevTrail) =>
        TrailManager.addTrailPoint(prevTrail, newBall.x, newBall.y)
      );

      // Check for scoring
      if (newBall.x < 0) {
        // Ball went off left side - Player missed, game over
        setGameState((prev) => {
          // Save to leaderboard when game ends using the centralized function
          saveToLeaderboard(prev.playerPoints, prev.difficulty);

          return {
            ...prev,
            status: GameStatus.GAME_OVER,
          };
        });
        return prevBall; // Don't update ball position yet
      } else if (newBall.x > GAME_CONFIG.gameWidth) {
        // Ball went off right side - AI missed, reset ball position but keep speed
        setTimeout(() => {
          setBall((prevBall) => {
            // Ensure the ball has a valid speed based on difficulty
            const config = DIFFICULTY_CONFIG[gameState.difficulty];
            const safeSpeed = Math.max(
              2.5,
              Math.min(prevBall.speed, config.maxSpeed)
            );
            return {
              ...prevBall,
              x: GAME_CONFIG.gameWidth / 2,
              y: GAME_CONFIG.gameHeight / 2 + (Math.random() - 0.5) * 100,
              dx: -safeSpeed, // Keep current speed, move left
              dy: (Math.random() - 0.5) * safeSpeed * 0.8,
              speed: safeSpeed,
            };
          });
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
    setGameState,
  };
};
