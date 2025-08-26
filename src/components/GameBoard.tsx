import React, { useRef } from 'react';
import { GAME_CONFIG } from '../utils/gameUtils';

interface GameBoardProps {
  onMouseMove: (y: number) => void;
  children: React.ReactNode;
}

const GameBoard: React.FC<GameBoardProps> = ({ onMouseMove, children }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      onMouseMove(relativeY);
    }
  };

  return (
    <div
      ref={canvasRef}
      className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 rounded-lg shadow-2xl overflow-hidden select-none"
      style={{
        width: `${GAME_CONFIG.gameWidth}px`,
        height: `${GAME_CONFIG.gameHeight}px`
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Center line */}
      <div 
        className="absolute bg-gray-600 opacity-40"
        style={{
          left: `${GAME_CONFIG.gameWidth / 2 - 1}px`,
          top: '0px',
          width: '2px',
          height: `${GAME_CONFIG.gameHeight}px`
        }}
      />
      
      {/* Dashed center line */}
      <div className="absolute left-1/2 top-0 w-0.5 h-full opacity-30 transform -translate-x-0.5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="bg-cyan-400 mb-2"
            style={{
              height: '12px',
              marginBottom: '8px'
            }}
          />
        ))}
      </div>

      {children}
    </div>
  );
};

export default GameBoard;