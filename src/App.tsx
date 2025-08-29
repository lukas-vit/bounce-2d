import React, { useState, useEffect } from "react";
import Menu from "./components/Menu";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";
import NicknameInput from "./components/NicknameInput";
import { Difficulty, GameStatus } from "./types/game";

/**
 * Main application component that manages the game state and renders appropriate components
 * based on the current game status (nickname input, menu, playing, leaderboard).
 */
function App() {
  const [appState, setAppState] = useState<GameStatus>(GameStatus.NICKNAME);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("medium");
  const [nickname, setNickname] = useState<string>("");

  useEffect(() => {
    const savedNickname = localStorage.getItem("bounce-nickname");
    if (savedNickname) {
      setNickname(savedNickname);
      setAppState(GameStatus.MENU);
    }
  }, []);

  /**
   * Handles nickname submission and transitions to the main menu
   * @param newNickname - The nickname entered by the user
   */
  const handleNicknameSubmit = (newNickname: string) => {
    setNickname(newNickname);
    setAppState(GameStatus.MENU);
  };

  /**
   * Starts a new game with the selected difficulty
   * @param difficulty - The difficulty level selected by the user
   */
  const handleStartGame = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setAppState(GameStatus.PLAYING);
  };

  /**
   * Ends the current game and returns to the main menu
   */
  const handleEndGame = () => {
    setAppState(GameStatus.MENU);
  };

  /**
   * Shows the leaderboard from the main menu
   */
  const handleShowLeaderboard = () => {
    setAppState(GameStatus.LEADERBOARD);
  };

  /**
   * Returns to the main menu from other screens
   */
  const handleBackToMenu = () => {
    setAppState(GameStatus.MENU);
  };

  /**
   * Renders the appropriate component based on the current app state
   * @returns The component to display based on current game status
   */
  const renderComponent = () => {
    switch (appState) {
      case GameStatus.NICKNAME:
        return <NicknameInput onNicknameSubmit={handleNicknameSubmit} />;
      case GameStatus.PLAYING:
        return (
          <Game
            difficulty={selectedDifficulty}
            onEndGame={handleEndGame}
            currentNickname={nickname}
          />
        );
      case GameStatus.LEADERBOARD:
        return (
          <Leaderboard onBack={handleBackToMenu} currentNickname={nickname} />
        );
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
