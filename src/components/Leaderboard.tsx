import React from "react";
import { Trophy, ArrowLeft, Medal, Award } from "lucide-react";
import {
  getLeaderboard,
  formatDifficulty,
  getDifficultyColor,
} from "../utils/gameUtils";

interface LeaderboardProps {
  onBack: () => void;
  currentNickname?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  onBack,
  currentNickname,
}) => {
  const leaderboard = getLeaderboard();

  console.log("Leaderboard data:", leaderboard); // Debug log

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">
            {index + 1}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 
              hover:bg-gray-700 px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">No scores yet!</p>
            <p className="text-gray-500">
              Play a game to set your first record
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 
                  ${
                    index < 3
                      ? "bg-gradient-to-r from-gray-700 to-gray-600 border-2 border-yellow-400/30"
                      : "bg-gray-700/50 border border-gray-600"
                  } hover:bg-gray-600/50 transform hover:scale-102`}
              >
                <div className="flex items-center gap-4">
                  {getRankIcon(index)}
                  <div>
                    <div
                      className={`text-lg font-semibold ${
                        entry.nickname === currentNickname
                          ? "text-cyan-400"
                          : "text-white"
                      }`}
                    >
                      {entry.nickname}
                    </div>
                    <div className="text-sm text-gray-400">
                      Score: {entry.score} • {entry.date}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${getDifficultyColor(
                      entry.difficulty
                    )}`}
                  >
                    {formatDifficulty(entry.difficulty)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Top 10 scores are saved locally
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
