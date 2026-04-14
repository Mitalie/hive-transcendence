import { PongEngine } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export type AIDifficulty = "easy" | "medium" | "hard";

export class AIOpponent {
  private engine: PongEngine;

  private reactionDelaySec: number;
  private errorMargin: number;

  // Internal time accumulators ensure the AI logic freezes exactly when
  // the physics engine delta drops to 0 (e.g., during a pause state).
  private timeSinceLastThought: number = 0;
  private timeSinceLastMistake: number = 0;

  private currentMistakeZ: number = 0;
  private currentMistakeX: number = 0;

  private targetZ: number = 0;
  private targetX: number = 0;

  private focusZ: number = 0;
  private focusX: number = 0;

  constructor(engine: PongEngine, difficulty: AIDifficulty) {
    this.engine = engine;

    const config = GameConfig.ai.difficulties[difficulty];
    // Convert milliseconds to seconds once during initialization to
    // optimize the frame-by-frame delta math loop.
    this.reactionDelaySec = config.reactionDelayMs / 1000;
    this.errorMargin = config.errorMargin;
  }

  public getInputs(delta: number): Record<string, boolean> {
    const inputs = {
      arrowup: false,
      arrowdown: false,
      arrowleft: false,
      arrowright: false,
    };

    const ball = this.engine.ball;
    const paddle = this.engine.p2;

    this.timeSinceLastMistake += delta;
    this.timeSinceLastThought += delta;

    // Recalculating mistakes on a strict interval prevents rapid vibration
    // of the target coordinate every frame.
    const mistakeIntervalSec = GameConfig.ai.mistakeUpdateIntervalMs / 1000;
    if (this.timeSinceLastMistake > mistakeIntervalSec) {
      this.timeSinceLastMistake = 0;
      this.currentMistakeZ = (Math.random() - 0.5) * this.errorMargin;
      this.currentMistakeX = (Math.random() - 0.5) * this.errorMargin;
    }

    // Simulates human reaction time by reading the ball's actual position
    // only after the accumulated delta exceeds the reaction delay.
    if (this.timeSinceLastThought >= this.reactionDelaySec) {
      this.timeSinceLastThought = 0;

      this.targetZ = ball.z + this.currentMistakeZ;
      const isBallTooHigh = ball.y > GameConfig.paddle.height;

      if (ball.x > 0) {
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

    const lerpBase =
      this.reactionDelaySec === 0
        ? GameConfig.ai.lerpSpeed.fast
        : GameConfig.ai.lerpSpeed.base;

    // Frame-rate independent lerp formula.
    // Ensures the visual tracking speed remains mathematically identical
    // regardless of monitor refresh rate variations (e.g., 60Hz vs 144Hz).
    const lerpFactor =
      1 - Math.pow(1 - lerpBase, delta * GameConfig.paddleVisuals.fpsBase);

    this.focusZ += (this.targetZ - this.focusZ) * lerpFactor;
    this.focusX += (this.targetX - this.focusX) * lerpFactor;

    // Deadzones prevent micro-stuttering when the focus coordinate is
    // sufficiently close to the current paddle coordinate.
    if (this.focusZ > paddle.z + GameConfig.ai.deadzone.z)
      inputs.arrowdown = true;
    else if (this.focusZ < paddle.z - GameConfig.ai.deadzone.z)
      inputs.arrowup = true;

    if (this.focusX < paddle.x - GameConfig.ai.deadzone.x)
      inputs.arrowleft = true;
    else if (this.focusX > paddle.x + GameConfig.ai.deadzone.x)
      inputs.arrowright = true;

    return inputs;
  }

  public destroy() {
    // Teardown logic hook for future memory management
  }
}
