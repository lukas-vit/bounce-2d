import React from "react";
import { PaddleState } from "../types/game";

interface PaddleProps {
  paddle: PaddleState;
  x: number;
  isPlayer?: boolean;
}

const Paddle: React.FC<PaddleProps> = ({ paddle, x, isPlayer = false }) => {
  return (
    <div
      className={`absolute rounded transition-none ${
        isPlayer
          ? "bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg shadow-blue-500/50"
          : "bg-gradient-to-r from-red-500 to-red-400 shadow-lg shadow-red-500/50"
      } pointer-events-none`}
      style={{
        left: `${x}px`,
        top: `${paddle.y}px`,
        width: `${paddle.width}px`,
        height: `${paddle.height}px`,
        boxShadow: isPlayer
          ? "0 0 15px rgba(59, 130, 246, 0.6)"
          : "0 0 15px rgba(239, 68, 68, 0.6)",
      }}
    />
  );
};

export default Paddle;
