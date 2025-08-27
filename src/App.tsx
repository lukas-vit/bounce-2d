import React, { useState, useEffect } from "react";
import Menu from "./components/Menu";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";
import NicknameInput from "./components/NicknameInput";
import { Difficulty, GameStatus } from "./types/game";

function App() {
  const [appState, setAppState] = useState<GameStatus>(GameStatus.NICKNAME);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("medium");
  const [nickname, setNickname] = useState<string>("");

  useEffect(() => {
    // Check if nickname already exists in localStorage
    const savedNickname = localStorage.getItem('bounce-nickname');
    if (savedNickname) {
      setNickname(savedNickname);
      setAppState(GameStatus.MENU);
    }
  }, []);

  const handleNicknameSubmit = (newNickname: string) => {
    setNickname(newNickname);
    setAppState(GameStatus.MENU);
  };

  const handleStartGame = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setAppState(GameStatus.PLAYING);
  };

  const handleEndGame = () => {
    setAppState(GameStatus.MENU);
  };

  const handleGameOver = () => {
    setAppState(GameStatus.LEADERBOARD);
  };

  const handleShowLeaderboard = () => {
    setAppState(GameStatus.LEADERBOARD);
  };

  const handleBackToMenu = () => {
    setAppState(GameStatus.MENU);
  };

  // Render appropriate component based on app state
  const renderComponent = () => {
    switch (appState) {
      case GameStatus.NICKNAME:
        return <NicknameInput onNicknameSubmit={handleNicknameSubmit} />;
      case GameStatus.PLAYING:
        return (
          <Game 
            difficulty={selectedDifficulty} 
            onEndGame={handleEndGame} 
            onGameOver={handleGameOver}
            currentNickname={nickname} 
          />
        );
      case GameStatus.LEADERBOARD:
        return <Leaderboard onBack={handleBackToMenu} currentNickname={nickname} />;
      case GameStatus.MENU:
      default:
        return (
          <Menu
            onStartGame={handleStartGame}
            onShowLeaderboard={handleShowLeaderboard}
            onChangeNickname={() => setAppState(GameStatus.NICKNAME)}
            currentNickname={nickname}
          />
        );
    }
  };

  return renderComponent();
}

export default App;
