import React, { useState } from "react";
import { PowerUp as PowerUpType } from "../types/game";
import {
  getPowerUpIcon,
  getPowerUpColor,
  getPowerUpName,
} from "../config/gameConfig";

interface PowerUpProps {
  powerUp: PowerUpType;
  onCollect?: (powerUp: PowerUpType) => void;
}

/**
 * PowerUp component that renders collectible power-ups on the game board.
 * Displays power-up icons with appropriate colors and animations.
 */
const PowerUp: React.FC<PowerUpProps> = ({ powerUp, onCollect }) => {
  const [isCollected, setIsCollected] = useState(false);

  if (isCollected) {
    return null;
  }

  return (
    <div
      className={`absolute w-8 h-8 ${getPowerUpColor(
        powerUp.type
      )} rounded-full border-2 flex items-center justify-center text-lg font-bold shadow-lg animate-pulse cursor-pointer transition-all duration-300 hover:scale-110`}
      style={{
        left: powerUp.x - powerUp.size / 2,
        top: powerUp.y - powerUp.size / 2,
        width: powerUp.size,
        height: powerUp.size,
      }}
      title={getPowerUpName(powerUp.type)}
      onClick={() => {
        setIsCollected(true);
        onCollect?.(powerUp);
      }}
    >
      {getPowerUpIcon(powerUp.type)}
    </div>
  );
};

export default PowerUp;
