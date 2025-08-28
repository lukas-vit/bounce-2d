import React from "react";
import { Ball as BallType } from "../types/game";

interface BallProps {
  ball: BallType;
}

const Ball: React.FC<BallProps> = ({ ball }) => {
  return (
    <>
      {/* Engaging particle effects */}
      {ball.particles.map((particle, index) => {
        const maxAge = 80; // Particles live longer for better effect
        const normalizedAge = Math.min(particle.age / maxAge, 1);
        
        // Skip very old particles
        if (normalizedAge >= 1) return null;
        
        // Different particle types with unique behaviors
        let particleStyle: React.CSSProperties = {};
        
        switch (particle.type) {
          case 'sparkle':
            // Sparkle particles - bright, twinkling effect
            const sparkleSize = particle.size * (0.8 + Math.sin(particle.age * 0.5) * 0.2);
            particleStyle = {
              width: `${sparkleSize}px`,
              height: `${sparkleSize}px`,
              backgroundColor: `rgba(255, 255, 255, ${0.9 * (1 - normalizedAge)})`,
              boxShadow: `0 0 ${8 + normalizedAge * 12}px rgba(255, 255, 255, ${0.8 * (1 - normalizedAge)})`,
              borderRadius: '50%',
            };
            break;
            
          case 'glow':
            // Glow particles - soft, ethereal effect
            const glowSize = particle.size * (1.2 - normalizedAge * 0.4);
            particleStyle = {
              width: `${glowSize}px`,
              height: `${glowSize}px`,
              backgroundColor: `rgba(173, 216, 230, ${0.7 * (1 - normalizedAge)})`,
              boxShadow: `0 0 ${12 + normalizedAge * 18}px rgba(173, 216, 230, ${0.6 * (1 - normalizedAge)})`,
              borderRadius: '50%',
              filter: 'blur(1px)',
            };
            break;
            
          case 'trail':
            // Trail particles - smooth, flowing effect
            const trailSize = particle.size * (0.6 + normalizedAge * 0.4);
            particleStyle = {
              width: `${trailSize}px`,
              height: `${trailSize}px`,
              backgroundColor: `rgba(135, 206, 250, ${0.8 * (1 - normalizedAge)})`,
              boxShadow: `0 0 ${6 + normalizedAge * 10}px rgba(135, 206, 250, ${0.5 * (1 - normalizedAge)})`,
              borderRadius: '50%',
            };
            break;
        }
        
        return (
          <div
            key={`particle-${index}`}
            className="absolute"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              transform: "translate(-50%, -50%)",
              zIndex: 15 + index, // Proper layering
              opacity: 1 - normalizedAge,
              pointerEvents: "none",
              transition: "none", // Disable transitions for smooth movement
              ...particleStyle,
            }}
          />
        );
      })}
      
      {/* Main ball with enhanced glow */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          left: `${ball.x}px`,
          top: `${ball.y}px`,
          width: `${ball.size}px`,
          height: `${ball.size}px`,
          transform: "translate(-50%, -50%)",
          zIndex: 30, // Above all particles
          boxShadow: `
            0 0 20px rgba(255, 255, 255, 0.9),
            0 0 40px rgba(173, 216, 230, 0.4)
          `,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default Ball;
