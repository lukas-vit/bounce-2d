import React from "react";
import { BallState, TrailPoint } from "../types/game";

interface BallProps {
  ball: BallState;
  trail: TrailPoint[];
}

const Ball: React.FC<BallProps> = ({ ball, trail }) => {
  return (
    <>
      {/* Ball trail with smooth gradient effect */}
      {trail.map((point, index) => {
        // Create a gradient from light pink to red like in the image
        const trailSize = ball.size * (0.7 + index * 0.015); // More subtle size variation
        const intensity = 1 - index * 0.06;
        const redValue = Math.floor(255 * intensity);
        const greenValue = Math.floor(100 + 155 * intensity);
        const blueValue = Math.floor(150 + 105 * intensity);

        return (
          <div
            key={point.id}
            className="absolute rounded-full ball-trail trail-fade"
            style={{
              left: `${point.x}px`,
              top: `${point.y}px`,
              width: `${trailSize}px`,
              height: `${trailSize}px`,
              opacity: point.opacity,
              transform: "translate(-50%, -50%)",
              zIndex: 10 + index,
              backgroundColor: `rgb(${redValue}, ${greenValue}, ${blueValue})`,
              filter: `blur(${Math.max(0, 0.5 - intensity * 0.3)}px)`,
              boxShadow: `0 0 ${Math.floor(
                6 * intensity
              )}px rgba(${redValue}, ${greenValue}, ${blueValue}, ${
                point.opacity * 0.7
              })`,
            }}
          />
        );
      })}

      {/* Main ball with enhanced glow effect */}
      <div
        className="absolute rounded-full bg-white ball-main"
        style={{
          left: `${ball.x}px`,
          top: `${ball.y}px`,
          width: `${ball.size}px`,
          height: `${ball.size}px`,
          transform: "translate(-50%, -50%)",
          zIndex: 20,
          boxShadow:
            "0 0 25px rgba(255, 255, 255, 0.9), 0 0 50px rgba(255, 255, 255, 0.4)",
          pointerEvents: "none",
          filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
        }}
      />
    </>
  );
};

export default Ball;
