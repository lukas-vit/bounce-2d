import React, { useState, useEffect } from "react";
import { User, ArrowRight } from "lucide-react";

interface NicknameInputProps {
  onNicknameSubmit: (nickname: string) => void;
}

const NicknameInput: React.FC<NicknameInputProps> = ({ onNicknameSubmit }) => {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Focus the input when component mounts
    const input = document.getElementById("nickname-input");
    if (input) {
      input.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length === 0) {
      setError("Please enter a nickname");
      return;
    }

    if (trimmedNickname.length > 20) {
      setError("Nickname must be 20 characters or less");
      return;
    }

    // Save nickname to localStorage
    localStorage.setItem("bounce-nickname", trimmedNickname);
    onNicknameSubmit(trimmedNickname);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Welcome to Bounce!
          </h1>
          <p className="text-gray-400 text-lg">
            Enter your nickname to start your Pong adventure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="nickname-input"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Nickname
            </label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter your nickname..."
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300
                hover:border-gray-500"
              maxLength={20}
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 
              text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 
              flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your nickname will appear in the leaderboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default NicknameInput;
