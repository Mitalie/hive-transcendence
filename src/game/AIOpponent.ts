import { PongEngine } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export type AIDifficulty = "easy" | "medium" | "hard";

export class AIOpponent {
  private engine: PongEngine;

  private reactionDelaySec: number;
  private errorMargin: number;
  private mistakeIntervalSec: number;
  private isInstant: boolean;
  private lerpRate: number;

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

    // Load the specific configuration block for the selected difficulty
    const config = GameConfig.ai.difficulties[difficulty];

    this.reactionDelaySec = config.reactionDelayMs / 1000;
    this.errorMargin = config.errorMargin;
    this.mistakeIntervalSec = config.mistakeIntervalSec;
    this.lerpRate = config.lerpSpeed;
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

    // Calculate time until the ball reaches the AI's baseline
    const distanceToAI = paddle.x - ball.x;
    const timeToImpact =
      ball.vx > 0 && distanceToAI > 0 ? distanceToAI / ball.vx : 999;

    if (this.timeSinceLastThought >= this.reactionDelaySec) {
      this.timeSinceLastThought = 0;

      if (isBallStationary) {
        this.targetZ = 0;
        this.targetX = GameConfig.player2.xPos;
      } else {
        // Calculate dynamic safe zone for targeting based on current paddle size
        const paddleMod =
          GameConfig.difficultyModifiers[
            this.isInstant ? "hard" : this.lerpRate < 5 ? "easy" : "medium"
          ].paddleSizeMultiplier;
        const currentPaddleDepth = GameConfig.paddle.depth * paddleMod;
        const safeZLimit = GameConfig.court.zLimit - currentPaddleDepth / 2;

        let predictedZ = ball.z;

        // Spin Awareness: Calculate the curve over time (Advanced Mode only)
        let spinCurveEffect = 0;
        if (this.engine.mode === "advanced" && timeToImpact !== 999) {
          spinCurveEffect = ball.spin * (timeToImpact * timeToImpact) * 0.5;
        }

        // Multi-bounce trajectory prediction
        if (ball.vy < -0.01 && ball.y > GameConfig.ball.radius) {
          // Ball falling: Predict floor intercept
          const timeToFloor =
            (ball.y - GameConfig.ball.radius) / Math.abs(ball.vy);
          predictedZ = ball.z + ball.vz * timeToFloor + spinCurveEffect;
        } else if (ball.vy > 0.01) {
          // Ball rising: Predict ceiling ricochet -> then floor intercept
          const CEILING =
            GameConfig.court.wallHeight * 3 - GameConfig.ball.radius;
          const timeToCeiling = (CEILING - ball.y) / ball.vy;
          const zAtCeiling = ball.z + ball.vz * timeToCeiling;

          const vyAfterCeiling = -ball.vy * GameConfig.ball.bounceFriction;
          const timeFromCeilingToFloor =
            (CEILING - GameConfig.ball.radius) / Math.abs(vyAfterCeiling);
          predictedZ =
            zAtCeiling + ball.vz * timeFromCeilingToFloor + spinCurveEffect;
        } else {
          predictedZ = ball.z + ball.vz * timeToImpact + spinCurveEffect;
        }

        this.targetZ =
          Math.max(Math.min(predictedZ, safeZLimit), -safeZLimit) +
          this.currentMistakeZ;

        // X-Axis Targeting (Strictly for Advanced Mode)
        if (this.engine.mode === "advanced") {
          const isBallTooHigh = ball.y > GameConfig.paddle.height;
          const isFloatingLob =
            ball.vx > 0 && ball.vx < GameConfig.ball.startVelocityX * 0.8;

          if (ball.vx > 0 && ball.x > GameConfig.court.centerX) {
            if (isBallTooHigh) {
              this.targetX =
                GameConfig.court.xLimit - GameConfig.ai.lobBackpedalOffset;
            } else if (this.isInstant && isFloatingLob) {
              // Aggression: Attack the net to smash slow balls early
              this.targetX = GameConfig.court.centerX + 2;
            } else {
              this.targetX = ball.x + this.currentMistakeX;
            }
          } else {
            this.targetX = GameConfig.player2.xPos;
          }
        } else {
          // Hard lock to baseline in Classic
          this.targetX = GameConfig.player2.xPos;
        }
      }
    }

    // --- STRIKE PHASE (Hard Mode Boss Logic) ---
    let finalTargetZ = this.targetZ;
    let finalTargetX = this.targetX;

    if (this.isInstant && timeToImpact < 0.25 && ball.vx > 0) {
      const safeEdge = (GameConfig.paddle.width / 2) * 0.8;
      const p1Z = this.engine.p1.z;

      // 1. The Sniper: Aim away from the player to weaponize Deflection Boost
      if (p1Z > ball.z) {
        finalTargetZ = ball.z - safeEdge;
      } else {
        finalTargetZ = ball.z + safeEdge;
      }

      // 2 & 3. The Smasher & Curveball (Strictly for Advanced Mode Only)
      if (this.engine.mode === "advanced") {
        // Push target X forward to accelerate through the ball on impact
        finalTargetX = GameConfig.player2.xPos - 2;

        // Strafe violently 0.1s before impact to apply Swipe Spin
        if (timeToImpact < 0.1) {
          finalTargetZ += ball.z > 0 ? -3 : 3;
        }
      }
    }

    // Frame-rate independent continuous exponential decay for smooth AI tracking (Advanced mode)
    const lerpFactor = 1 - Math.exp(-this.lerpRate * delta);
    this.focusZ += (finalTargetZ - this.focusZ) * lerpFactor;
    this.focusX += (finalTargetX - this.focusX) * lerpFactor;

    const p2Keys = GameConfig.player2.controls;

    if (this.engine.mode === "classic") {
      // In Classic, read the raw final target to prevent "fake sliding" caused by smooth focus tracking
      const distanceToTargetZ = finalTargetZ - paddle.z;
      const stepDist = GameConfig.paddle.maxVelocity * delta;

      // Z-axis Anti-Jitter Snap ONLY
      if (Math.abs(distanceToTargetZ) > stepDist) {
        inputs[distanceToTargetZ > 0 ? p2Keys.down : p2Keys.up] = true;
      } else {
        paddle.z = finalTargetZ;
        paddle.vz = 0;
      }

      // Strictly lock X-axis to baseline for Classic mode
      paddle.x = GameConfig.player2.xPos;
      paddle.vx = 0;
    } else {
      // Advanced mode relies on momentum and friction, handles X and Z using smoothed focus coordinates
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
