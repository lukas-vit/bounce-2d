import { Home, Pause, Play } from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  Difficulty,
  getGameDimensions,
  getPowerUpIcon,
  getPowerUpName,
  isMobileDevice,
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

/**
 * Main game component that handles the game board, paddles, ball, and power-ups.
 * Manages game state transitions and displays game information.
 */
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

  const [showExtraLifeUsed, setShowExtraLifeUsed] = React.useState(false);
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    if (gameState.status === GameStatus.MENU) {
      startGame(difficulty);
    }
  }, [difficulty, startGame, gameState.status]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (extraLifeConsumed) {
      setShowExtraLifeUsed(true);
      const timer = setTimeout(() => {
        setShowExtraLifeUsed(false);
        resetExtraLifeConsumed();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [extraLifeConsumed, resetExtraLifeConsumed]);

  useEffect(() => {
    if (gameState.status === GameStatus.GAME_OVER) {
      const timer = setTimeout(() => {
        onGameOver();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, onGameOver]);

  /**
   * Handles keyboard events for game controls
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && gameState.status === GameStatus.PLAYING) {
        e.preventDefault(); // Prevent page scrolling
        pauseGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pauseGame, gameState.status]);

  /**
   * Handles mouse movement to update player paddle position
   * @param y - The Y coordinate of the mouse
   */
  const handleMouseMove = (y: number) => {
    updatePlayerPaddle(y);
  };

  /**
   * Handles ending the current game and returning to menu
   */
  const handleEndGame = () => {
    onEndGame();
  };

  const isGameOver = gameState.status === GameStatus.GAME_OVER;
  const isPlaying = gameState.status === GameStatus.PLAYING;
  const isPaused = gameState.isPaused;
  const showLeaderboard = gameState.status === GameStatus.LEADERBOARD;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-2 sm:p-8">
      {!showLeaderboard && (
        <div
          className={`mb-4 sm:mb-8 flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl gap-4 ${
            isMobile ? "px-2" : ""
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={handleEndGame}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 
                text-white rounded-lg transition-all duration-300 border border-gray-600 hover:border-gray-500 text-sm sm:text-base"
            >
              <Home className="w-4 h-4" />
              {isMobile ? "Menu" : "Menu"}
            </button>
          </div>

          <div className="flex items-center justify-center bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl px-4 sm:px-8 py-3 sm:py-4 relative">
            <div className="text-center">
              <div className="text-sm sm:text-lg font-medium text-cyan-400 mb-1">
                {currentNickname}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                {gameState.playerScore}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Score</div>
            </div>

            {gameState.extraLives > 0 && (
              <div className="absolute -right-16 sm:-right-24 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg px-2 sm:px-3 py-2">
                <div className="text-xs text-gray-400">Extra:</div>
                <div className="flex gap-1">
                  {Array.from({ length: gameState.extraLives }, (_, i) => (
                    <span
                      key={i}
                      className="text-pink-400 text-sm sm:text-base"
                    >
                      ❤️
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!showLeaderboard && activePowerUps.length > 0 && (
            <div
              className={`fixed ${
                isMobile ? "top-2 right-2" : "top-4 right-4"
              } z-50`}
            >
              <div className="bg-black/90 backdrop-blur-sm border border-gray-600 rounded-xl p-2 sm:p-3 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300 font-medium">
                    ACTIVE
                  </span>
                </div>

                <div className="flex gap-1 sm:gap-2">
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
                        <div className="relative">
                          <div
                            className={`${
                              isMobile ? "w-6 h-6" : "w-8 h-8"
                            } rounded-full flex items-center justify-center text-xs sm:text-sm bg-yellow-500 border-2 border-yellow-300`}
                          >
                            {getPowerUpIcon(powerUp.type)}
                          </div>
                          <svg
                            className={`absolute inset-0 ${
                              isMobile ? "w-6 h-6" : "w-8 h-8"
                            } transform -rotate-90`}
                            viewBox={`0 0 ${isMobile ? "24 24" : "32 32"}`}
                          >
                            <circle
                              cx={isMobile ? "12" : "16"}
                              cy={isMobile ? "12" : "16"}
                              r={isMobile ? "10" : "14"}
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
                                (remainingTime / (powerUp.duration / 1000)) *
                                (isMobile ? 63 : 88)
                              } ${isMobile ? "63" : "88"}`}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <div
                          className={`text-xs font-bold mt-1 px-1 sm:px-1.5 py-0.5 rounded-full ${
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

          <div className="flex items-center gap-3">
            {(isPlaying || isPaused) && (
              <button
                onClick={pauseGame}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-500 
                  text-white rounded-lg transition-all duration-300 border border-purple-500 hover:border-purple-400 text-sm sm:text-base"
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
                {isPaused
                  ? isMobile
                    ? "Resume"
                    : "Resume"
                  : isMobile
                  ? "Pause"
                  : "Pause"}
              </button>
            )}
          </div>
        </div>
      )}

      {!showLeaderboard && (
        <div className="relative">
          <GameBoard onMouseMove={handleMouseMove}>
            <Paddle paddle={playerPaddle} x={0} isPlayer={true} />
            <Paddle
              paddle={aiPaddle}
              x={getGameDimensions().width - getGameDimensions().paddleWidth}
              isPlayer={false}
            />

            <Ball ball={ball} />

            {powerUps.map((powerUp) => (
              <PowerUp key={powerUp.id} powerUp={powerUp} />
            ))}
          </GameBoard>

          {isPaused && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center">
                <Pause className="w-12 sm:w-16 h-12 sm:h-16 text-white mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Paused
                </h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  {isMobile
                    ? "Tap Resume to continue"
                    : "Click Resume to continue"}
                </p>
              </div>
            </div>
          )}

          {showExtraLifeUsed && (
            <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-pink-600/90 backdrop-blur-sm border border-pink-500 rounded-lg px-4 sm:px-6 py-2 sm:py-3 animate-bounce">
              <div className="flex items-center gap-2 text-white text-sm sm:text-base">
                <span className="text-xl sm:text-2xl">❤️</span>
                <span className="font-semibold">Extra Life Used!</span>
                <span className="text-xl sm:text-2xl">❤️</span>
              </div>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center bg-gray-800/90 p-4 sm:p-8 rounded-2xl border border-gray-700 mx-4">
                <div className="mb-4 sm:mb-6">
                  <div className="text-4xl sm:text-6xl mb-4">💀</div>
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold mb-4 text-red-400">
                  Game Over
                </h2>
                <p className="text-lg sm:text-xl text-gray-300 mb-4 sm:mb-6">
                  Final Score: {currentNickname} - {gameState.playerScore}{" "}
                  points
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button
                    onClick={resetGame}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg 
                      transition-all duration-300 border border-green-500 hover:border-green-400 text-sm sm:text-base"
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
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg 
                      transition-all duration-300 border border-purple-500 hover:border-purple-400 text-sm sm:text-base"
                  >
                    Leaderboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showLeaderboard && (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-0">
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

      {!showLeaderboard && (
        <div className="mt-4 sm:mt-8 text-center max-w-2xl px-2 sm:px-0">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">
              <span className="font-semibold text-white">Player:</span>{" "}
              <span className="text-cyan-400">{currentNickname}</span> •{" "}
              <span className="font-semibold text-white">Difficulty:</span>{" "}
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </p>
            <p className="text-gray-500 text-xs">
              {isMobile
                ? "Touch and drag to control the left paddle • Score points every time you successfully hit the ball • Ball speed increases with each point • Game ends when you miss the ball • Collect power-ups that appear every 5 points for special effects! • Extra life power-ups give you another chance when you miss the ball!"
                : "Move your mouse to control the left paddle • Score points every time you successfully hit the ball • Ball speed increases with each point • Game ends when you miss the ball • Collect power-ups that appear every 5 points for special effects! • Extra life power-ups give you another chance when you miss the ball!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
