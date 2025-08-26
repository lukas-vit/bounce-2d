import React, { useState } from 'react';
import Menu from './components/Menu';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import { Difficulty } from './types/game';

type AppState = 'menu' | 'game' | 'leaderboard';

function App() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  const handleStartGame = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setAppState('game');
  };

  const handleEndGame = () => {
    setAppState('menu');
  };

  const handleShowLeaderboard = () => {
    setAppState('leaderboard');
  };

  const handleBackToMenu = () => {
    setAppState('menu');
  };

  if (appState === 'game') {
    return (
      <Game 
        difficulty={selectedDifficulty} 
        onEndGame={handleEndGame} 
      />
    );
  }

  if (appState === 'leaderboard') {
    return <Leaderboard onBack={handleBackToMenu} />;
  }

  return (
    <Menu 
      onStartGame={handleStartGame}
      onShowLeaderboard={handleShowLeaderboard}
    />
  );
}

export default App;