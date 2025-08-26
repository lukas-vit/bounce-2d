import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, BallState, PaddleState, TrailPoint, Difficulty } from '../types/game';
import { DIFFICULTY_CONFIG, GAME_CONFIG, saveToLeaderboard } from '../utils/gameUtils';

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    playerScore: 0,
    aiScore: 0,
    difficulty: 'medium',
    gameStarted: false
  });

  const [ball, setBall] = useState<BallState>({
    x: GAME_CONFIG.gameWidth / 2,
    y: GAME_CONFIG.gameHeight / 2,
    dx: 3,
    dy: 2,
    speed: 3
  });

  const [playerPaddle, setPlayerPaddle] = useState<PaddleState>({
    y: GAME_CONFIG.gameHeight / 2 - GAME_CONFIG.paddleHeight / 2,
    height: GAME_CONFIG.paddleHeight,
    speed: 6
  });

  const [aiPaddle, setAiPaddle] = useState<PaddleState>({
    y: GAME_CONFIG.gameHeight / 2 - GAME_CONFIG.paddleHeight / 2,
    height: GAME_CONFIG.paddleHeight,
    speed: 4
  });

  const [ballTrail, setBallTrail] = useState<TrailPoint[]>([]);
  const gameLoopRef = useRef<number>();
  const trailIdRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());

  const resetBall = useCallback((direction: number = 1) => {
    const config = DIFFICULTY_CONFIG[gameState.difficulty];
    const speed = 3 * config.ballSpeedMultiplier;
    
    setBall({
      x: GAME_CONFIG.gameWidth / 2,
      y: GAME_CONFIG.gameHeight / 2 + (Math.random() - 0.5) * 100,
      dx: direction * speed * (Math.random() > 0.5 ? 1 : -1),
      dy: (Math.random() - 0.5) * speed * 0.8,
      speed
    });
    setBallTrail([]);
  }, [gameState.difficulty]);

  const updateAI = useCallback((ballPos: BallState, aiPos: PaddleState) => {
    const config = DIFFICULTY_CONFIG[gameState.difficulty];
    const paddleCenter = aiPos.y + aiPos.height / 2;
    const targetY = ballPos.y;
    const diff = targetY - paddleCenter;
    
    // Add some randomness based on difficulty
    const reaction = config.aiReactionTime;
    const movement = diff * config.aiSpeed * reaction;
    
    let newY = aiPos.y + movement;
    newY = Math.max(0, Math.min(GAME_CONFIG.gameHeight - aiPos.height, newY));
    
    return { ...aiPos, y: newY };
  }, [gameState.difficulty]);

  const checkCollisions = useCallback((ballPos: BallState) => {
    let newBall = { ...ballPos };
    
    // Top and bottom boundaries
    if (ballPos.y <= 0 || ballPos.y >= GAME_CONFIG.gameHeight - GAME_CONFIG.ballSize) {
      newBall.dy *= -1;
      newBall.y = Math.max(0, Math.min(GAME_CONFIG.gameHeight - GAME_CONFIG.ballSize, ballPos.y));
    }
    
    // Player paddle collision
    if (ballPos.x <= GAME_CONFIG.paddleWidth + GAME_CONFIG.ballSize &&
        ballPos.y + GAME_CONFIG.ballSize >= playerPaddle.y &&
        ballPos.y <= playerPaddle.y + playerPaddle.height) {
      newBall.dx = Math.abs(newBall.dx);
      const hitPos = (ballPos.y + GAME_CONFIG.ballSize / 2 - playerPaddle.y) / playerPaddle.height - 0.5;
      newBall.dy += hitPos * 2;
      newBall.speed *= 1.05;
    }
    
    // AI paddle collision
    if (ballPos.x + GAME_CONFIG.ballSize >= GAME_CONFIG.gameWidth - GAME_CONFIG.paddleWidth &&
        ballPos.y + GAME_CONFIG.ballSize >= aiPaddle.y &&
        ballPos.y <= aiPaddle.y + aiPaddle.height) {
      newBall.dx = -Math.abs(newBall.dx);
      const hitPos = (ballPos.y + GAME_CONFIG.ballSize / 2 - aiPaddle.y) / aiPaddle.height - 0.5;
      newBall.dy += hitPos * 2;
      newBall.speed *= 1.05;
    }
    
    return newBall;
  }, [playerPaddle, aiPaddle]);

  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Update AI paddle
    setAiPaddle(prevAi => updateAI(ball, prevAi));

    // Update ball position
    setBall(prevBall => {
      let newBall = {
        ...prevBall,
        x: prevBall.x + prevBall.dx,
        y: prevBall.y + prevBall.dy
      };

      newBall = checkCollisions(newBall);

      // Add trail point
      setBallTrail(prevTrail => {
        const newTrail = [...prevTrail, {
          x: newBall.x,
          y: newBall.y,
          opacity: 1,
          id: trailIdRef.current++
        }];
        
        // Update trail opacities and remove old ones
        return newTrail
          .map(point => ({ ...point, opacity: point.opacity * 0.85 }))
          .filter(point => point.opacity > 0.1)
          .slice(-12);
      });

      // Check for scoring
      if (newBall.x < 0) {
        // Ball went off left side - AI scores
        setGameState(prev => {
          const newAiScore = prev.aiScore + 1;
          if (newAiScore >= GAME_CONFIG.winningScore) {
            return { ...prev, isPlaying: false, aiScore: newAiScore };
          }
          return { ...prev, aiScore: newAiScore };
        });
        setTimeout(() => resetBall(1), 500);
      } else if (newBall.x > GAME_CONFIG.gameWidth) {
        // Ball went off right side - Player scores
        setGameState(prev => {
          const newPlayerScore = prev.playerScore + 1;
          if (newPlayerScore >= GAME_CONFIG.winningScore) {
            saveToLeaderboard(newPlayerScore, prev.difficulty);
            return { ...prev, isPlaying: false, playerScore: newPlayerScore };
          }
          return { ...prev, playerScore: newPlayerScore };
        });
        setTimeout(() => resetBall(-1), 500);
      }

      return newBall;
    });


    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, gameState.isPaused, checkCollisions, updateAI, resetBall]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState.isPlaying, gameState.isPaused]);

  const startGame = (difficulty: Difficulty) => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      gameStarted: true,
      difficulty,
      playerScore: 0,
      aiScore: 0
    }));
    setTimeout(() => resetBall(Math.random() > 0.5 ? 1 : -1), 100);
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const resetGame = () => {
    setGameState({
      isPlaying: false,
      isPaused: false,
      playerScore: 0,
      aiScore: 0,
      difficulty: 'medium',
      gameStarted: false
    });
    resetBall();
    setBallTrail([]);
  };

  const updatePlayerPaddle = (mouseY: number) => {
    setPlayerPaddle(prev => ({
      ...prev,
      y: Math.max(0, Math.min(GAME_CONFIG.gameHeight - prev.height, mouseY - prev.height / 2))
    }));
  };

  return {
    gameState,
    ball,
    playerPaddle,
    aiPaddle,
    ballTrail,
    startGame,
    pauseGame,
    resetGame,
    updatePlayerPaddle
  };
};