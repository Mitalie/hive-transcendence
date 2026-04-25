import { PongEngine } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export type AIDifficulty = "easy" | "medium" | "hard";

export class AIOpponent {
  private engine: PongEngine;

  private reactionDelaySec: number;
  private errorMargin: number;
  private mistakeIntervalSec: number;
  private isInstant: boolean;

  private timeSinceLastThought: number = 0;
  private timeSinceLastMistake: number = 0;

  private currentMistakeZ: number = 0;
  private currentMistakeX: number = 0;

  private targetZ: number = 0;
  private targetX: number;

  private focusZ: number = 0;
  private focusX: number;

  constructor(engine: PongEngine, difficulty: AIDifficulty) {
    this.engine = engine;

    const config = GameConfig.ai.difficulties[difficulty];
    this.reactionDelaySec = config.reactionDelayMs / 1000;
    this.errorMargin = config.errorMargin;
    this.mistakeIntervalSec = config.mistakeIntervalSec;
    this.isInstant = difficulty === "hard";

    // Initialize to starting positions to prevent a rapid jerk on frame 1
    this.targetX = GameConfig.player2.xPos;
    this.focusX = GameConfig.player2.xPos;
  }

  public getInputs(delta: number): Record<string, boolean> {
    const inputs: Record<string, boolean> = {};
    const ball = this.engine.ball;
    const paddle = this.engine.p2;

    // A small epsilon check ensures robustness against floating-point residuals
    // when determining if the ball is stationary (e.g., waiting for a serve).
    const isBallStationary =
      Math.abs(ball.vx) < 0.001 && Math.abs(ball.vz) < 0.001;

    this.timeSinceLastMistake += delta;
    this.timeSinceLastThought += delta;

    if (this.timeSinceLastMistake > this.mistakeIntervalSec) {
      this.timeSinceLastMistake = 0;
      this.currentMistakeZ = (Math.random() - 0.5) * this.errorMargin;
      this.currentMistakeX = (Math.random() - 0.5) * this.errorMargin;
    }

    if (this.timeSinceLastThought >= this.reactionDelaySec) {
      this.timeSinceLastThought = 0;

      if (isBallStationary) {
        this.targetZ = 0;
        this.targetX = GameConfig.player2.xPos;
      } else {
        const zLimit = GameConfig.paddle.zLimit;

        // Multi-bounce trajectory prediction
        if (ball.vy < -0.01 && ball.y > GameConfig.ball.radius) {
          // Ball falling: Predict floor intercept
          const timeToFloor =
            (ball.y - GameConfig.ball.radius) / Math.abs(ball.vy);
          const predictedZ = ball.z + ball.vz * timeToFloor;
          this.targetZ =
            Math.max(Math.min(predictedZ, zLimit), -zLimit) +
            this.currentMistakeZ;
        } else if (ball.vy > 0.01) {
          // Ball rising: Predict ceiling ricochet -> then floor intercept
          const CEILING =
            GameConfig.court.wallHeight * 3 - GameConfig.ball.radius;
          const timeToCeiling = (CEILING - ball.y) / ball.vy;
          const zAtCeiling = ball.z + ball.vz * timeToCeiling;

          const vyAfterCeiling = -ball.vy * GameConfig.ball.bounceFriction;
          const timeFromCeilingToFloor =
            (CEILING - GameConfig.ball.radius) / Math.abs(vyAfterCeiling);
          const predictedZ = zAtCeiling + ball.vz * timeFromCeilingToFloor;

          this.targetZ =
            Math.max(Math.min(predictedZ, zLimit), -zLimit) +
            this.currentMistakeZ;
        } else {
          this.targetZ = ball.z + this.currentMistakeZ;
        }

        const isBallTooHigh = ball.y > GameConfig.paddle.height;

        if (ball.vx > 0 && ball.x > GameConfig.court.centerX) {
          if (isBallTooHigh) {
            this.targetX =
              GameConfig.court.xLimit - GameConfig.ai.lobBackpedalOffset;
          } else {
            this.targetX = ball.x + this.currentMistakeX;
          }
        } else {
          this.targetX = GameConfig.player2.xPos;
        }
      }
    }

    const lerpRate = this.isInstant
      ? GameConfig.ai.lerpSpeed.fast
      : GameConfig.ai.lerpSpeed.base;

    // Frame-rate independent continuous exponential decay for smooth AI tracking
    const lerpFactor = 1 - Math.exp(-lerpRate * delta);

    this.focusZ += (this.targetZ - this.focusZ) * lerpFactor;
    this.focusX += (this.targetX - this.focusX) * lerpFactor;

    const p2Keys = GameConfig.player2.controls;

    if (this.engine.mode === "classic") {
      const distanceToTargetZ = this.focusZ - paddle.z;
      const distanceToTargetX = this.focusX - paddle.x;
      const stepDist = GameConfig.paddle.maxVelocity * delta;

      // Z-axis Anti-Jitter Snap
      if (Math.abs(distanceToTargetZ) > stepDist) {
        inputs[distanceToTargetZ > 0 ? p2Keys.down : p2Keys.up] = true;
      } else {
        paddle.z = this.focusZ; // Snap exactly to the target so it doesn't overshoot
        paddle.vz = 0; // Stop all velocity to prevent jittering
      }

      // X-axis Anti-Jitter Snap (for lob returns)
      if (Math.abs(distanceToTargetX) > stepDist) {
        inputs[distanceToTargetX > 0 ? p2Keys.right : p2Keys.left] = true;
      } else {
        paddle.x = this.focusX; // Snap exactly to the target
        paddle.vx = 0;
      }
    } else {
      // Advanced mode relies on momentum and friction, so standard deadzones work cleanly
      if (this.focusZ > paddle.z + GameConfig.ai.deadzone.z)
        inputs[p2Keys.down] = true;
      else if (this.focusZ < paddle.z - GameConfig.ai.deadzone.z)
        inputs[p2Keys.up] = true;

      if (this.focusX < paddle.x - GameConfig.ai.deadzone.x)
        inputs[p2Keys.left] = true;
      else if (this.focusX > paddle.x + GameConfig.ai.deadzone.x)
        inputs[p2Keys.right] = true;
    }

    return inputs;
  }

  public destroy() {}
}
