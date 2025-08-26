import React from 'react';
import { Pause, Play, RotateCcw, Home } from 'lucide-react';
import { GameState, BallState, PaddleState, TrailPoint, Difficulty } from '../types/game';
import { DIFFICULTY_CONFIG, GAME_CONFIG } from '../utils/gameUtils';
import GameBoard from './GameBoard';
import Ball from './Ball';
import Paddle from './Paddle';
import { useGame } from '../hooks/useGame';

interface GameProps {
  difficulty: Difficulty;
  onEndGame: () => void;
}

const Game: React.FC<GameProps> = ({ difficulty, onEndGame }) => {
  const {
    gameState,
    ball,
    playerPaddle,
    aiPaddle,
    ballTrail,
    startGame,
    pauseGame,
    resetGame,
    updatePlayerPaddle
  } = useGame();

  // Start the game when component mounts with the selected difficulty
  React.useEffect(() => {
    if (!gameState.gameStarted) {
      startGame(difficulty);
    }
  }, [difficulty]);

  const handleMouseMove = (y: number) => {
    updatePlayerPaddle(y);
  };

  const handleEndGame = () => {
    resetGame();
    onEndGame();
  };

  const isGameOver = !gameState.isPlaying && gameState.gameStarted;
  const winner = gameState.playerScore >= GAME_CONFIG.winningScore ? 'Player' : 'AI';

  // Debug logging
  console.log('Game state:', gameState);
  console.log('Is game over:', isGameOver, 'Winner:', winner);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      {/* Header with score and controls */}
      <div className="mb-8 flex items-center justify-between w-full max-w-4xl">
        <div className="flex items-center gap-6">
          <button
            onClick={handleEndGame}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 
              text-white rounded-lg transition-all duration-300 border border-gray-600 hover:border-gray-500"
          >
            <Home className="w-4 h-4" />
            Menu
          </button>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl px-8 py-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{gameState.playerScore}</div>
            <div className="text-sm text-gray-400">Player</div>
          </div>
          <div className="text-3xl font-bold text-gray-500">:</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{gameState.aiScore}</div>
            <div className="text-sm text-gray-400">AI</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {gameState.isPlaying && (
            <button
              onClick={pauseGame}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 
                text-white rounded-lg transition-all duration-300 border border-purple-500 hover:border-purple-400"
            >
              {gameState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {gameState.isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
          
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 
              text-white rounded-lg transition-all duration-300 border border-gray-600 hover:border-gray-500"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative">
        <GameBoard onMouseMove={handleMouseMove}>
          {/* Paddles */}
          <Paddle 
            paddle={playerPaddle} 
            x={0} 
            isPlayer={true}
          />
          <Paddle 
            paddle={aiPaddle} 
            x={GAME_CONFIG.gameWidth - GAME_CONFIG.paddleWidth}
            isPlayer={false}
          />
          
          {/* Ball with trail */}
          <Ball ball={ball} trail={ballTrail} />
        </GameBoard>

        {/* Game Status Overlays */}
        {gameState.isPaused && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Pause className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Paused</h2>
              <p className="text-gray-300">Click Resume to continue</p>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center bg-gray-800/90 p-8 rounded-2xl border border-gray-700">
              <div className="mb-6">
                {winner === 'Player' ? (
                  <div className="text-6xl mb-4">🎉</div>
                ) : (
                  <div className="text-6xl mb-4">🤖</div>
                )}
              </div>
              <h2 className={`text-4xl font-bold mb-4 ${
                winner === 'Player' ? 'text-green-400' : 'text-red-400'
              }`}>
                {winner === 'Player' ? 'Victory!' : 'Defeat!'}
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Final Score: {gameState.playerScore} - {gameState.aiScore}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg 
                    transition-all duration-300 border border-blue-500 hover:border-blue-400"
                >
                  Play Again
                </button>
                <button
                  onClick={handleEndGame}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg 
                    transition-all duration-300 border border-gray-500 hover:border-gray-400"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="mt-8 text-center max-w-2xl">
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-2">
            <span className="font-semibold text-white">Difficulty:</span> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </p>
          <p className="text-gray-500 text-xs">
            Move your mouse to control the left paddle • First to {GAME_CONFIG.winningScore} points wins
          </p>
        </div>
      </div>
    </div>
  );
};

export default Game;