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

    const isBallStationary = ball.vx === 0 && ball.vz === 0;

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
        this.targetZ = ball.z + this.currentMistakeZ;
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

    if (this.focusZ > paddle.z + GameConfig.ai.deadzone.z)
      inputs[p2Keys.down] = true;
    else if (this.focusZ < paddle.z - GameConfig.ai.deadzone.z)
      inputs[p2Keys.up] = true;

    if (this.focusX < paddle.x - GameConfig.ai.deadzone.x)
      inputs[p2Keys.left] = true;
    else if (this.focusX > paddle.x + GameConfig.ai.deadzone.x)
      inputs[p2Keys.right] = true;

    return inputs;
  }

  public destroy() {}
}
