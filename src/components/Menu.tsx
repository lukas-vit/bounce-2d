import React from 'react';
import { Play, Trophy, Settings } from 'lucide-react';
import { Difficulty } from '../types/game';
import { formatDifficulty, getDifficultyColor } from '../utils/gameUtils';

interface MenuProps {
  onStartGame: (difficulty: Difficulty) => void;
  onShowLeaderboard: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame, onShowLeaderboard }) => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          PING PONG
        </h1>
        <p className="text-xl text-gray-400">Challenge the AI in this modern Pong experience</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">Select Difficulty</h2>
        
        <div className="space-y-4 mb-8">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => onStartGame(difficulty)}
              className={`w-full p-4 rounded-xl transition-all duration-300 border-2 border-gray-600 hover:border-cyan-400 
                bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 
                transform hover:scale-105 hover:shadow-lg flex items-center justify-between group`}
            >
              <span className="flex items-center gap-3">
                <Play className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                <span className="text-lg font-medium text-white">
                  {formatDifficulty(difficulty)}
                </span>
              </span>
              <span className={`text-sm font-semibold ${getDifficultyColor(difficulty)}`}>
                {difficulty === 'easy' && 'Beginner'}
                {difficulty === 'medium' && 'Normal'}
                {difficulty === 'hard' && 'Challenging'}
                {difficulty === 'expert' && 'Insane'}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onShowLeaderboard}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 
            hover:from-purple-500 hover:to-purple-400 transition-all duration-300 
            transform hover:scale-105 border-2 border-purple-500 hover:border-purple-400
            flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/25"
        >
          <Trophy className="w-5 h-5" />
          <span className="text-lg font-medium text-white">Leaderboard</span>
        </button>
      </div>

      <div className="mt-8 text-center text-gray-500">
        <p className="text-sm">Move your mouse to control the left paddle</p>
        <p className="text-xs mt-2">First to 7 points wins!</p>
      </div>
    </div>
  );
};

export default Menu;