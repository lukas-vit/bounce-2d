import React, { useRef, useEffect, useState } from "react";
import { getGameDimensions } from "../config/gameConfig";

interface GameBoardProps {
  onMouseMove: (y: number) => void;
  children: React.ReactNode;
}

/**
 * GameBoard component that handles the game board and mouse/touch movement
 * @param onMouseMove - Callback function to handle mouse/touch movement
 * @param children - React nodes to render inside the game board
 */
const GameBoard: React.FC<GameBoardProps> = ({ onMouseMove, children }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState(getGameDimensions());

  // Update dimensions when window resizes
  useEffect(() => {
    const handleResize = () => {
      setDimensions(getGameDimensions());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      onMouseMove(relativeY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const relativeY = touch.clientY - rect.top;
      onMouseMove(relativeY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const relativeY = touch.clientY - rect.top;
      onMouseMove(relativeY);
    }
  };

  return (
    <div
      ref={canvasRef}
      className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 rounded-lg shadow-2xl overflow-hidden select-none game-board"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        maxWidth: "100vw",
        maxHeight: "100vh",
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div
        className="absolute bg-gray-600 opacity-40"
        style={{
          left: `${dimensions.width / 2 - 1}px`,
          top: "0px",
          width: "2px",
          height: `${dimensions.height}px`,
        }}
      />

      <div className="absolute left-1/2 top-0 w-0.5 h-full opacity-30 transform -translate-x-0.5">
        {Array.from({ length: Math.floor(dimensions.height / 20) }).map(
          (_, i) => (
            <div
              key={i}
              className="bg-cyan-400 mb-2"
              style={{
                height: "12px",
                marginBottom: "8px",
              }}
            />
          )
        )}
      </div>

      {children}
    </div>
  );
};

export default GameBoard;
