import React from "react";
import { Ball as BallType } from "../types/game";

interface BallProps {
  ball: BallType;
}

const Ball: React.FC<BallProps> = ({ ball }) => {
  return (
    <div
      className="absolute rounded-full bg-white"
      style={{
        left: `${ball.x}px`,
        top: `${ball.y}px`,
        width: `${ball.size}px`,
        height: `${ball.size}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 20,
        boxShadow: "0 0 20px rgba(255, 255, 255, 0.8)",
        pointerEvents: "none",
      }}
    />
  );
};

export default Ball;
