import React from "react";
import { Play, Trophy, User, Edit3 } from "lucide-react";
import { Difficulty, isMobileDevice } from "../config/gameConfig";
import {
  formatDifficulty,
  getDifficultyColor,
  getDifficultyDescription,
  getDifficultyLabel,
  DIFFICULTIES,
} from "../utils/gameUtils";

interface MenuProps {
  onStartGame: (difficulty: Difficulty) => void;
  onShowLeaderboard: () => void;
  onChangeNickname: () => void;
  currentNickname: string;
}

/**
 * Menu component that displays the main menu and allows starting a game
 * @param onStartGame - Callback function to start a game with a difficulty
 * @param onShowLeaderboard - Callback function to show the leaderboard
 * @param onChangeNickname - Callback function to change the player's nickname
 * @param currentNickname - The current nickname of the player
 */
const Menu: React.FC<MenuProps> = ({
  onStartGame,
  onShowLeaderboard,
  onChangeNickname,
  currentNickname,
}) => {
  const isMobile = isMobileDevice();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-8">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          PING PONG
        </h1>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg max-w-md w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium text-sm sm:text-base">
              Playing as:{" "}
              <span className="text-cyan-400">{currentNickname}</span>
            </span>
          </div>
          <button
            onClick={onChangeNickname}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 
              hover:bg-gray-700 px-3 py-1 rounded-lg text-sm"
          >
            <Edit3 className="w-4 h-4" />
            Change
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 sm:p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center text-white">
          Select Difficulty
        </h2>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => onStartGame(difficulty)}
              className={`w-full p-3 sm:p-4 rounded-xl transition-all duration-300 border-2 border-gray-600 hover:border-cyan-400 
                bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 
                transform hover:scale-105 hover:shadow-lg flex items-center justify-between group`}
            >
              <span className="flex items-center gap-2 sm:gap-3">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:text-cyan-300" />
                <span className="text-base sm:text-lg font-medium text-white">
                  {formatDifficulty(difficulty)}
                </span>
              </span>
              <span
                className={`text-xs sm:text-sm font-semibold ${getDifficultyColor(
                  difficulty
                )}`}
              >
                {getDifficultyLabel(difficulty)}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onShowLeaderboard}
          className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 
            hover:from-purple-500 hover:to-purple-400 transition-all duration-300 
            transform hover:scale-105 border-2 border-purple-500 hover:border-purple-400
            flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-purple-500/25"
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-base sm:text-lg font-medium text-white">
            Leaderboard
          </span>
        </button>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2">
            Difficulty Effects:
          </h3>
          <div className="text-xs text-gray-400 space-y-1">
            {DIFFICULTIES.map((difficulty) => (
              <p key={difficulty}>
                •{" "}
                <span className={getDifficultyColor(difficulty)}>
                  {formatDifficulty(difficulty)}:
                </span>{" "}
                {getDifficultyDescription(difficulty)}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 text-center text-gray-500 px-4">
        <p className="text-xs sm:text-sm">
          {isMobile
            ? "Touch and drag to control the left paddle"
            : "Move your mouse to control the left paddle"}
        </p>
        <p className="text-xs mt-2">Get as many points as possible!</p>
      </div>
    </div>
  );
};

export default Menu;
