import React from "react";
import { Trophy, ArrowLeft, Medal, Award, Trash2 } from "lucide-react";
import {
  getLeaderboard,
  formatDifficulty,
  getDifficultyColor,
  clearLeaderboard,
} from "../utils/gameUtils";

interface LeaderboardProps {
  onBack: () => void;
  currentNickname?: string;
}

/**
 * Leaderboard component that displays the leaderboard and allows clearing scores
 * @param onBack - Callback function to go back to the menu
 * @param currentNickname - The current nickname of the player
 */
const Leaderboard: React.FC<LeaderboardProps> = ({
  onBack,
  currentNickname,
}) => {
  const leaderboard = getLeaderboard();

  const handleClearLeaderboard = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all scores? This cannot be undone."
      )
    ) {
      clearLeaderboard();
      window.location.reload();
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />;
      case 2:
        return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm">
            {index + 1}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3 sm:p-8">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-3 sm:p-8 shadow-2xl w-full max-w-sm sm:max-w-2xl mx-2 sm:mx-0">
        {/* Header Section - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 gap-3 sm:gap-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 
              hover:bg-gray-700 px-3 py-2.5 rounded-lg text-sm sm:text-base min-h-[44px] min-w-[44px] justify-center
              active:bg-gray-600 touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <h1 className="text-xl sm:text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent order-first sm:order-none">
            Leaderboard
          </h1>

          <button
            onClick={handleClearLeaderboard}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors duration-300 
              hover:bg-red-900/20 px-3 py-2.5 rounded-lg text-sm sm:text-base min-h-[44px] min-w-[44px] justify-center
              active:bg-red-900/30 touch-manipulation"
            title="Clear all scores"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Empty State - Mobile Optimized */}
        {leaderboard.length === 0 ? (
          <div className="text-center py-6 sm:py-12">
            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-lg sm:text-xl text-gray-400 mb-2 font-medium">
              No scores yet!
            </p>
            <p className="text-gray-500 text-sm sm:text-base px-2">
              Play a game to set your first record
            </p>
          </div>
        ) : (
          /* Leaderboard Entries - Mobile Optimized */
          <div className="space-y-2 sm:space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-300 
                  ${
                    index < 3
                      ? "bg-gradient-to-r from-gray-700 to-gray-600 border-2 border-yellow-400/30"
                      : "bg-gray-700/50 border border-gray-600"
                  } hover:bg-gray-600/50 active:bg-gray-600/70 transform active:scale-[0.98] gap-3 sm:gap-4`}
              >
                {/* Left Section - Rank and Player Info */}
                <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                  {getRankIcon(index)}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-base sm:text-lg font-semibold truncate ${
                        entry.nickname === currentNickname
                          ? "text-cyan-400"
                          : "text-white"
                      }`}
                      title={entry.nickname}
                    >
                      {entry.nickname}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">
                      <span className="font-medium">Score: {entry.score}</span>
                      <span className="mx-2">•</span>
                      <span>{entry.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Difficulty */}
                <div className="self-end sm:self-center w-full sm:w-auto">
                  <div
                    className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full bg-gray-800/50 border border-gray-600 
                      ${getDifficultyColor(
                        entry.difficulty
                      )} text-center sm:text-right`}
                  >
                    {formatDifficulty(entry.difficulty)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer - Mobile Optimized */}
        <div className="mt-4 sm:mt-8 text-center pt-2 border-t border-gray-700/50">
          <p className="text-xs sm:text-sm text-gray-500">Top 10 scores</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
