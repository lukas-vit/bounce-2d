import { Ball, Paddle } from "../types/game";

/**
 * Advanced collision detection system for reliable paddle-ball collisions.
 * Handles edge cases like high-speed tunneling and provides consistent collision detection.
 */

/**
 * Main collision detection function with proper ball centering
 * @param ball - The ball object to check collision for
 * @param paddle - The paddle object to check collision against
 * @param paddleX - The X coordinate of the paddle
 * @returns True if collision detected, false otherwise
 */
export const checkPaddleCollision = (
  ball: Ball,
  paddle: Paddle,
  paddleX: number
): boolean => {
  const ballLeft = ball.x - ball.size / 2;
  const ballRight = ball.x + ball.size / 2;
  const ballTop = ball.y - ball.size / 2;
  const ballBottom = ball.y + ball.size / 2;

  const paddleLeft = paddleX;
  const paddleRight = paddleX + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  const tolerance = 3;

  return (
    ballRight + tolerance >= paddleLeft &&
    ballLeft - tolerance <= paddleRight &&
    ballBottom + tolerance >= paddleTop &&
    ballTop - tolerance <= paddleBottom
  );
};

/**
 * Continuous collision detection to prevent tunneling at high speeds
 * @param prevBall - The ball's previous position
 * @param currentBall - The ball's current position
 * @param paddle - The paddle object to check collision against
 * @param paddleX - The X coordinate of the paddle
 * @returns True if collision detected in the ball's trajectory, false otherwise
 */
export const checkPaddleCollisionContinuous = (
  prevBall: Ball,
  currentBall: Ball,
  paddle: Paddle,
  paddleX: number
): boolean => {
  const ballLeft = Math.min(prevBall.x, currentBall.x) - currentBall.size / 2;
  const ballRight = Math.max(prevBall.x, currentBall.x) + currentBall.size / 2;
  const ballTop = Math.min(prevBall.y, currentBall.y) - currentBall.size / 2;
  const ballBottom = Math.max(prevBall.y, currentBall.y) + currentBall.size / 2;

  const paddleLeft = paddleX;
  const paddleRight = paddleX + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  return (
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom
  );
};

/**
 * Predictive collision detection for very high speeds
 * @param ball - The ball object to check collision for
 * @param paddle - The paddle object to check collision against
 * @param paddleX - The X coordinate of the paddle
 * @param lookAheadFrames - Number of frames to look ahead (default: 2)
 * @returns True if collision predicted, false otherwise
 */
export const checkPaddleCollisionPredictive = (
  ball: Ball,
  paddle: Paddle,
  paddleX: number,
  lookAheadFrames: number = 2
): boolean => {
  const predictedBall = {
    ...ball,
    x: ball.x + ball.vx * lookAheadFrames,
    y: ball.y + ball.vy * lookAheadFrames,
  };

  return checkPaddleCollision(predictedBall, paddle, paddleX);
};

/**
 * Comprehensive collision detection that combines all methods
 * @param prevBall - The ball's previous position
 * @param currentBall - The ball's current position
 * @param paddle - The paddle object to check collision against
 * @param paddleX - The X coordinate of the paddle
 * @returns True if any collision detection method detects a collision, false otherwise
 */
export const checkPaddleCollisionComprehensive = (
  prevBall: Ball,
  currentBall: Ball,
  paddle: Paddle,
  paddleX: number
): boolean => {
  if (checkPaddleCollision(currentBall, paddle, paddleX)) {
    return true;
  }

  if (checkPaddleCollisionContinuous(prevBall, currentBall, paddle, paddleX)) {
    return true;
  }

  if (checkPaddleCollisionPredictive(currentBall, paddle, paddleX)) {
    return true;
  }

  return false;
};

/**
 * Power-up collision detection with consistent ball centering
 * @param ball - The ball object to check collision for
 * @param powerUp - The power-up object to check collision against
 * @returns True if collision detected, false otherwise
 */
export const checkPowerUpCollision = (ball: Ball, powerUp: any): boolean => {
  const ballLeft = ball.x - ball.size / 2;
  const ballRight = ball.x + ball.size / 2;
  const ballTop = ball.y - ball.size / 2;
  const ballBottom = ball.y + ball.size / 2;

  const powerUpLeft = powerUp.x - powerUp.size / 2;
  const powerUpRight = powerUp.x + powerUp.size / 2;
  const powerUpTop = powerUp.y - powerUp.size / 2;
  const powerUpBottom = powerUp.y + powerUp.size / 2;

  const tolerance = 2;

  return (
    ballRight + tolerance > powerUpLeft &&
    ballLeft - tolerance < powerUpRight &&
    ballBottom + tolerance > powerUpTop &&
    ballTop - tolerance < powerUpBottom
  );
};
