import { Home, Pause, Play } from "lucide-react";
import React, { useEffect } from "react";

import {
  Difficulty,
  getGameDimensions,
  getPowerUpIcon,
  getPowerUpName,
} from "../config/gameConfig";
import { useGame } from "../hooks/useGame";
import { GameStatus } from "../types/game";
import Ball from "./Ball";
import GameBoard from "./GameBoard";
import Leaderboard from "./Leaderboard";
import Paddle from "./Paddle";
import PowerUp from "./PowerUp";

interface GameProps {
  difficulty: Difficulty;
  onEndGame: () => void;
  onGameOver: () => void;
  currentNickname: string;
}

const Game: React.FC<GameProps> = ({
  difficulty,
  onEndGame,
  onGameOver,
  currentNickname,
}) => {
  const {
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
    updatePlayerPaddle,
    setGameState,
    resetExtraLifeConsumed,
  } = useGame();

  // Track when extra life is used for display
  const [showExtraLifeUsed, setShowExtraLifeUsed] = React.useState(false);

  // Start the game when component mounts with the selected difficulty
  useEffect(() => {
    if (gameState.status === GameStatus.MENU) {
      startGame(difficulty);
    }
  }, [difficulty, startGame, gameState.status]);

  // Show extra life used indicator when extra life is consumed
  useEffect(() => {
    if (extraLifeConsumed) {
      setShowExtraLifeUsed(true);
      const timer = setTimeout(() => {
        setShowExtraLifeUsed(false);
        // Reset the flag after the toast is hidden
        resetExtraLifeConsumed();
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [extraLifeConsumed, resetExtraLifeConsumed]);

  // Handle game over state transition
  useEffect(() => {
    if (gameState.status === GameStatus.GAME_OVER) {
      // Small delay to show the game over screen before transitioning
      const timer = setTimeout(() => {
        onGameOver();
      }, 2000); // 2 seconds delay
      return () => clearTimeout(timer);
    }
  }, [gameState.status, onGameOver]);

  const handleMouseMove = (y: number) => {
    updatePlayerPaddle(y);
  };

  const handleEndGame = () => {
    onEndGame();
  };

  const isGameOver = gameState.status === GameStatus.GAME_OVER;
  const isPlaying = gameState.status === GameStatus.PLAYING;
  const isPaused = gameState.isPaused;
  const showLeaderboard = gameState.status === GameStatus.LEADERBOARD;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      {/* Header with score and controls */}
      {!showLeaderboard && (
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

          {/* Player Score Display */}
          <div className="flex items-center justify-center bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl px-8 py-4">
            <div className="text-center">
              <div className="text-lg font-medium text-cyan-400 mb-1">
                {currentNickname}
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {gameState.playerScore}
              </div>
              <div className="text-sm text-gray-400">Score</div>
            </div>
          </div>

          {/* Active Power-ups Display */}
          {!showLeaderboard && activePowerUps.length > 0 && (
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-black/90 backdrop-blur-sm border border-gray-600 rounded-xl p-3 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300 font-medium">
                    ACTIVE
                  </span>
                </div>

                <div className="flex gap-2">
                  {activePowerUps.map((powerUp) => {
                    const remainingTime = Math.ceil(
                      (powerUp.duration - (Date.now() - powerUp.createdAt)) /
                        1000
                    );

                    return (
                      <div
                        key={powerUp.id}
                        className="flex flex-col items-center"
                        title={`${getPowerUpName(
                          powerUp.type
                        )} - ${remainingTime}s left`}
                      >
                        {/* Power-up Icon with Time Ring */}
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-yellow-500 border-2 border-yellow-300">
                            {getPowerUpIcon(powerUp.type)}
                          </div>
                          {/* Time Ring */}
                          <svg
                            className="absolute inset-0 w-8 h-8 transform -rotate-90"
                            viewBox="0 0 32 32"
                          >
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              className={`${
                                remainingTime > 10
                                  ? "text-green-400"
                                  : remainingTime > 5
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                              strokeDasharray={`${
                                (remainingTime / (powerUp.duration / 1000)) * 88
                              } 88`}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        {/* Time Badge */}
                        <div
                          className={`text-xs font-bold mt-1 px-1.5 py-0.5 rounded-full ${
                            remainingTime > 10
                              ? "bg-green-500/20 text-green-300"
                              : remainingTime > 5
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {remainingTime}s
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Extra Lives Display */}
          {gameState.extraLives > 0 && (
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2">
              <div className="text-sm text-gray-400">Extra Lives:</div>
              <div className="flex gap-1">
                {Array.from({ length: gameState.extraLives }, (_, i) => (
                  <span key={i} className="text-pink-400 text-lg">
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {(isPlaying || isPaused) && (
              <button
                onClick={pauseGame}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 
                  text-white rounded-lg transition-all duration-300 border border-purple-500 hover:border-purple-400"
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Game Board Container */}
      {!showLeaderboard && (
        <div className="relative">
          <GameBoard onMouseMove={handleMouseMove}>
            {/* Paddles */}
            <Paddle paddle={playerPaddle} x={0} isPlayer={true} />
            <Paddle
              paddle={aiPaddle}
              x={getGameDimensions().width - getGameDimensions().paddleWidth}
              isPlayer={false}
            />

            {/* Ball */}
            <Ball ball={ball} />

            {/* Power-ups */}
            {powerUps.map((powerUp) => (
              <PowerUp key={powerUp.id} powerUp={powerUp} />
            ))}
          </GameBoard>

          {/* Game Status Overlays */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center">
                <Pause className="w-16 h-16 text-white mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Paused</h2>
                <p className="text-gray-300">Click Resume to continue</p>
              </div>
            </div>
          )}

          {/* Extra Life Used Indicator */}
          {showExtraLifeUsed && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-pink-600/90 backdrop-blur-sm border border-pink-500 rounded-lg px-6 py-3 animate-bounce">
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl">❤️</span>
                <span className="font-semibold">Extra Life Used!</span>
                <span className="text-2xl">❤️</span>
              </div>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center bg-gray-800/90 p-8 rounded-2xl border border-gray-700">
                <div className="mb-6">
                  <div className="text-6xl mb-4">💀</div>
                </div>
                <h2 className="text-4xl font-bold mb-4 text-red-400">
                  Game Over
                </h2>
                <p className="text-xl text-gray-300 mb-6">
                  Final Score: {currentNickname} - {gameState.playerScore}{" "}
                  points
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg 
                      transition-all duration-300 border border-green-500 hover:border-green-400"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() =>
                      setGameState((prev) => ({
                        ...prev,
                        status: GameStatus.LEADERBOARD,
                      }))
                    }
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg 
                      transition-all duration-300 border border-purple-500 hover:border-purple-400"
                  >
                    Leaderboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Display */}
      {showLeaderboard && (
        <div className="w-full max-w-6xl mx-auto">
          <Leaderboard
            onBack={() =>
              setGameState((prev) => ({
                ...prev,
                status: GameStatus.GAME_OVER,
              }))
            }
            currentNickname={currentNickname}
          />
        </div>
      )}

      {/* Game Info */}
      {!showLeaderboard && (
        <div className="mt-8 text-center max-w-2xl">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">
              <span className="font-semibold text-white">Player:</span>{" "}
              <span className="text-cyan-400">{currentNickname}</span> •{" "}
              <span className="font-semibold text-white">Difficulty:</span>{" "}
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </p>
            <p className="text-gray-500 text-xs">
              Move your mouse to control the left paddle • Score points every
              time you successfully hit the ball • Ball speed increases with
              each point • Game ends when you miss the ball • Collect power-ups
              that appear every 5 points for special effects! • Extra life
              power-ups give you another chance when you miss the ball!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
