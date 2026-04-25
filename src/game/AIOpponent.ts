import { PongEngine } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export type AIDifficulty = "easy" | "medium" | "hard";

export class AIOpponent {
  private engine: PongEngine;
  private difficulty: AIDifficulty;
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
    this.difficulty = difficulty;
    const config = GameConfig.ai.difficulties[difficulty];
    this.reactionDelaySec = config.reactionDelayMs / 1000;
    this.errorMargin = config.errorMargin;
    this.mistakeIntervalSec = config.mistakeIntervalSec;
    this.lerpRate = config.lerpSpeed;
    this.isInstant = difficulty === "hard";
    this.targetX = this.focusX = GameConfig.player2.xPos;
  }

  public getInputs(delta: number): Record<string, boolean> {
    const inputs: Record<string, boolean> = {};
    const ball = this.engine.ball;
    const paddle = this.engine.p2;

    const isBallStationary =
      Math.abs(ball.vx) < 0.001 && Math.abs(ball.vz) < 0.001;
    this.timeSinceLastMistake += delta;
    this.timeSinceLastThought += delta;

    if (this.timeSinceLastMistake > this.mistakeIntervalSec) {
      this.timeSinceLastMistake = 0;
      this.currentMistakeZ = (Math.random() - 0.5) * this.errorMargin;
      this.currentMistakeX = (Math.random() - 0.5) * this.errorMargin;
    }

    const distanceToAI = paddle.x - ball.x;
    const isApproaching = ball.vx > 0 && distanceToAI > 0;
    const timeToImpact = isApproaching ? distanceToAI / ball.vx : 0;

    if (this.timeSinceLastThought >= this.reactionDelaySec) {
      this.timeSinceLastThought = 0;
      if (isBallStationary) {
        this.targetZ = 0;
        this.targetX = GameConfig.player2.xPos;
      } else {
        const paddleMod =
          GameConfig.difficultyModifiers[this.difficulty].paddleSizeMultiplier;
        const safeZLimit =
          GameConfig.court.zLimit - (GameConfig.paddle.depth * paddleMod) / 2;

        let predictedZ = ball.z;
        let spinCurveEffect = 0;
        if (
          this.engine.mode === "advanced" &&
          isApproaching &&
          timeToImpact < 5
        ) {
          spinCurveEffect = ball.spin * (timeToImpact * timeToImpact) * 0.5;
        }

        if (ball.vy < -0.01 && ball.y > GameConfig.ball.radius) {
          const timeToFloor =
            (ball.y - GameConfig.ball.radius) / Math.abs(ball.vy);
          predictedZ = ball.z + ball.vz * timeToFloor + spinCurveEffect;
        } else if (ball.vy > 0.01) {
          const CEILING =
            GameConfig.court.wallHeight *
              GameConfig.court.physicsCeilingMultiplier -
            GameConfig.ball.radius;
          const timeToCeiling = (CEILING - ball.y) / ball.vy;
          const vyAfterCeiling = -ball.vy * GameConfig.ball.bounceFriction;
          const timeFromCeilingToFloor =
            (CEILING - GameConfig.ball.radius) / Math.abs(vyAfterCeiling);
          predictedZ =
            ball.z +
            ball.vz * timeToCeiling +
            ball.vz * timeFromCeilingToFloor +
            spinCurveEffect;
        } else {
          predictedZ =
            ball.z +
            (isApproaching ? ball.vz * timeToImpact : 0) +
            spinCurveEffect;
        }
        this.targetZ =
          Math.max(Math.min(predictedZ, safeZLimit), -safeZLimit) +
          this.currentMistakeZ;

        if (this.engine.mode === "advanced") {
          const isBallTooHigh = ball.y > GameConfig.paddle.height;
          const isFloatingLob =
            ball.vx > 0 && ball.vx < GameConfig.ball.startVelocityX * 0.8;
          if (ball.vx > 0 && ball.x > GameConfig.court.centerX) {
            this.targetX = isBallTooHigh
              ? GameConfig.court.xLimit - GameConfig.ai.lobBackpedalOffset
              : this.isInstant && isFloatingLob
                ? GameConfig.court.centerX + 2
                : ball.x + this.currentMistakeX;
          } else {
            this.targetX = GameConfig.player2.xPos;
          }
        } else {
          this.targetX = GameConfig.player2.xPos;
        }
      }
    }

    let finalTargetZ = this.targetZ;
    let finalTargetX = this.targetX;

    if (this.isInstant && isApproaching && timeToImpact < 0.25) {
      const safeEdge = (GameConfig.paddle.width / 2) * 0.8;
      finalTargetZ =
        this.engine.p1.z > ball.z ? ball.z - safeEdge : ball.z + safeEdge;
      if (this.engine.mode === "advanced") {
        finalTargetX = GameConfig.player2.xPos - 2;
        if (timeToImpact < 0.1) finalTargetZ += ball.z > 0 ? -3 : 3;
      }
    }

    if (this.engine.mode === "advanced") {
      const lerpFactor = 1 - Math.exp(-this.lerpRate * delta);
      this.focusZ += (finalTargetZ - this.focusZ) * lerpFactor;
      this.focusX += (finalTargetX - this.focusX) * lerpFactor;
    }

    const p2Keys = GameConfig.player2.controls;
    if (this.engine.mode === "classic") {
      const distanceZ = finalTargetZ - paddle.z;
      const stepDist = GameConfig.paddle.maxVelocity * delta;
      if (Math.abs(distanceZ) > stepDist)
        inputs[distanceZ > 0 ? p2Keys.down : p2Keys.up] = true;
    } else {
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
