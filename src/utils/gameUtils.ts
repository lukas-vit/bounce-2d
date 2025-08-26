import { Difficulty, LeaderboardEntry } from '../types/game';

export const DIFFICULTY_CONFIG = {
  easy: { aiSpeed: 0.3, aiReactionTime: 0.8, ballSpeedMultiplier: 1 },
  medium: { aiSpeed: 0.5, aiReactionTime: 0.6, ballSpeedMultiplier: 1.2 },
  hard: { aiSpeed: 0.7, aiReactionTime: 0.4, ballSpeedMultiplier: 1.4 },
  expert: { aiSpeed: 0.9, aiReactionTime: 0.2, ballSpeedMultiplier: 1.6 }
};

export const GAME_CONFIG = {
  ballSize: 12,
  paddleWidth: 12,
  paddleHeight: 80,
  gameWidth: 800,
  gameHeight: 400,
  winningScore: 7
};

export const saveToLeaderboard = (score: number, difficulty: Difficulty): void => {
  console.log('Saving to leaderboard:', { score, difficulty }); // Debug log
  const leaderboard = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    score,
    difficulty,
    date: new Date().toLocaleDateString()
  };
  
  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score);
  const finalLeaderboard = leaderboard.slice(0, 10);
  localStorage.setItem('pingpong-leaderboard', JSON.stringify(finalLeaderboard));
  console.log('Leaderboard saved:', finalLeaderboard); // Debug log
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  const stored = localStorage.getItem('pingpong-leaderboard');
  const result = stored ? JSON.parse(stored) : [];
  console.log('Retrieved leaderboard:', result); // Debug log
  return result;
};

export const getDifficultyColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'hard': return 'text-orange-400';
    case 'expert': return 'text-red-400';
    default: return 'text-white';
  }
};

export const formatDifficulty = (difficulty: Difficulty): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};