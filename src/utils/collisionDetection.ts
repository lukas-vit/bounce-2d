import { Ball, Paddle } from "../types/game";

/**
 * Advanced collision detection system for reliable paddle-ball collisions
 * Handles edge cases like high-speed tunneling and provides consistent collision detection
 */

// Main collision detection function with proper ball centering
export const checkPaddleCollision = (
  ball: Ball,
  paddle: Paddle,
  paddleX: number
): boolean => {
  // Ball is positioned from its center, so calculate bounds from center
  const ballLeft = ball.x - ball.size / 2;
  const ballRight = ball.x + ball.size / 2;
  const ballTop = ball.y - ball.size / 2;
  const ballBottom = ball.y + ball.size / 2;

  // Paddle bounds
  const paddleLeft = paddleX;
  const paddleRight = paddleX + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  // Generous collision detection with tolerance for better user experience
  const tolerance = 3; // 3px tolerance for reliable collision detection
  
  return (
    ballRight + tolerance >= paddleLeft &&
    ballLeft - tolerance <= paddleRight &&
    ballBottom + tolerance >= paddleTop &&
    ballTop - tolerance <= paddleBottom
  );
};

// Continuous collision detection to prevent tunneling at high speeds
export const checkPaddleCollisionContinuous = (
  prevBall: Ball,
  currentBall: Ball,
  paddle: Paddle,
  paddleX: number
): boolean => {
  // Check if ball trajectory intersects with paddle
  const ballLeft = Math.min(prevBall.x, currentBall.x) - currentBall.size / 2;
  const ballRight = Math.max(prevBall.x, currentBall.x) + currentBall.size / 2;
  const ballTop = Math.min(prevBall.y, currentBall.y) - currentBall.size / 2;
  const ballBottom = Math.max(prevBall.y, currentBall.y) + currentBall.size / 2;

  // Paddle bounds
  const paddleLeft = paddleX;
  const paddleRight = paddleX + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  // Check if the ball's trajectory rectangle intersects with the paddle
  return (
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom
  );
};

// Predictive collision detection for very high speeds
export const checkPaddleCollisionPredictive = (
  ball: Ball,
  paddle: Paddle,
  paddleX: number,
  lookAheadFrames: number = 2
): boolean => {
  // Predict ball position in the next few frames
  const predictedBall = {
    ...ball,
    x: ball.x + ball.vx * lookAheadFrames,
    y: ball.y + ball.vy * lookAheadFrames,
  };

  // Check collision with predicted position
  return checkPaddleCollision(predictedBall, paddle, paddleX);
};

// Comprehensive collision detection that combines all methods
export const checkPaddleCollisionComprehensive = (
  prevBall: Ball,
  currentBall: Ball,
  paddle: Paddle,
  paddleX: number
): boolean => {
  // Check current position collision
  if (checkPaddleCollision(currentBall, paddle, paddleX)) {
    return true;
  }

  // Check continuous collision (trajectory)
  if (checkPaddleCollisionContinuous(prevBall, currentBall, paddle, paddleX)) {
    return true;
  }

  // Check predictive collision for high speeds
  if (checkPaddleCollisionPredictive(currentBall, paddle, paddleX)) {
    return true;
  }

  return false;
};

// Power-up collision detection with consistent ball centering
export const checkPowerUpCollision = (ball: Ball, powerUp: any): boolean => {
  const ballLeft = ball.x - ball.size / 2;
  const ballRight = ball.x + ball.size / 2;
  const ballTop = ball.y - ball.size / 2;
  const ballBottom = ball.y + ball.size / 2;

  const powerUpLeft = powerUp.x - powerUp.size / 2;
  const powerUpRight = powerUp.x + powerUp.size / 2;
  const powerUpTop = powerUp.y - powerUp.size / 2;
  const powerUpBottom = powerUp.y + powerUp.size / 2;

  // Add tolerance for better collision detection
  const tolerance = 2;
  
  return (
    ballRight + tolerance > powerUpLeft &&
    ballLeft - tolerance < powerUpRight &&
    ballBottom + tolerance > powerUpTop &&
    ballTop - tolerance < powerUpBottom
  );
};
