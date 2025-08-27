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
  getLeaderboard,
} from "../utils/gameUtils";
import { LeaderboardEntry } from "../types/game";

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

        // Award point for successful hit and increase ball speed
        setGameState((prev) => ({
          ...prev,
          playerPoints: prev.playerPoints + 1,
        }));

        // Increase ball speed when player scores (based on difficulty)
        const config = DIFFICULTY_CONFIG[gameState.difficulty];
        setBall((prevBall) => ({
          ...prevBall,
          speed: prevBall.speed * config.speedIncreaseMultiplier,
          dx:
            (prevBall.dx >= 0 ? 1 : -1) *
            prevBall.speed *
            config.speedIncreaseMultiplier,
          dy: prevBall.dy * config.speedIncreaseMultiplier,
        }));
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
          // Save to leaderboard when game ends
          const leaderboard = getLeaderboard();
          const nickname =
            localStorage.getItem("bounce-nickname") || "Anonymous";
          const newEntry = {
            nickname,
            score: prev.playerPoints,
            difficulty: prev.difficulty,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now(),
          };

          leaderboard.push(newEntry);
          leaderboard.sort(
            (a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score
          );
          const finalLeaderboard = leaderboard.slice(0, 10);
          localStorage.setItem(
            "bounce-leaderboard",
            JSON.stringify(finalLeaderboard)
          );

          return {
            ...prev,
            status: GameStatus.GAME_OVER,
          };
        });
        return prevBall; // Don't update ball position yet
      } else if (newBall.x > GAME_CONFIG.gameWidth) {
        // Ball went off right side - AI missed, reset ball position but keep speed
        setTimeout(() => {
          setBall((prevBall) => ({
            ...prevBall,
            x: GAME_CONFIG.gameWidth / 2,
            y: GAME_CONFIG.gameHeight / 2 + (Math.random() - 0.5) * 100,
            dx: -Math.abs(prevBall.speed), // Keep current speed, move left
            dy: (Math.random() - 0.5) * prevBall.speed * 0.8,
          }));
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
