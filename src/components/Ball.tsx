import React from 'react';
import { BallState, TrailPoint } from '../types/game';
import { GAME_CONFIG } from '../utils/gameUtils';

interface BallProps {
  ball: BallState;
  trail: TrailPoint[];
}

const Ball: React.FC<BallProps> = ({ ball, trail }) => {
  return (
    <>
      {/* Ball trail */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="absolute rounded-full bg-cyan-400 transition-opacity duration-100"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            width: `${GAME_CONFIG.ballSize}px`,
            height: `${GAME_CONFIG.ballSize}px`,
            opacity: point.opacity,
            transform: 'translate(-50%, -50%)',
            zIndex: 10 + index
          }}
        />
      ))}
      
      {/* Main ball */}
      <div
        className="absolute rounded-full bg-white shadow-lg shadow-cyan-500/50 transition-all duration-75"
        style={{
          left: `${ball.x}px`,
          top: `${ball.y}px`,
          width: `${GAME_CONFIG.ballSize}px`,
          height: `${GAME_CONFIG.ballSize}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.8)',
          pointerEvents: 'none'
        }}
      />
    </>
  );
};

export default Ball;