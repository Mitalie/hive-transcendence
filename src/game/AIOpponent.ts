import { PongEngine } from "./PongEngine";
import { GameConfig } from "./GameConfig";

export type AIDifficulty = "easy" | "medium" | "hard";

export class AIOpponent {
  private engine: PongEngine;
  private isEnabled: boolean = false;

  // Defaults (Medium)
  private reactionDelayMs: number = 250;
  private errorMargin: number = 0.5;

  private lastThoughtTime: number = 0;
  private lastMistakeTime: number = 0; // NEW: Keeps mistakes stable

  private currentMistakeZ: number = 0;
  private currentMistakeX: number = 0;

  private targetZ: number = 0;
  private targetX: number = 0;

  private focusZ: number = 0;
  private focusX: number = 0;

  constructor(engine: PongEngine) {
    this.engine = engine;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public setDifficulty(level: AIDifficulty) {
    switch (level) {
      case "easy":
        this.reactionDelayMs = 600;
        this.errorMargin = 1.5;
        break;
      case "medium":
        this.reactionDelayMs = 250;
        this.errorMargin = 0.5;
        break;
      case "hard":
        // PROS don't wait for snapshots! They track live.
        this.reactionDelayMs = 0;
        this.errorMargin = 0.05;
        break;
    }
  }

  public getInputs(): Record<string, boolean> {
    const inputs = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };

    if (!this.isEnabled) return inputs;

    const ball = this.engine.ball;
    const paddle = this.engine.p2;
    const now = Date.now();

    // --- 1. GENERATE MISTAKES (Only change mind every 600ms) ---
    // This stops the Math.random() from vibrating the target every frame
    if (now - this.lastMistakeTime > 600) {
      this.lastMistakeTime = now;
      this.currentMistakeZ = (Math.random() - 0.5) * this.errorMargin;
      this.currentMistakeX = (Math.random() - 0.5) * this.errorMargin;
    }

    // --- 2. THE BRAIN SNAPSHOT (How often it looks at the ball) ---
    if (now - this.lastThoughtTime >= this.reactionDelayMs) {
      this.lastThoughtTime = now;

      // Lock in the target with the stable mistake offset
      this.targetZ = ball.z + this.currentMistakeZ;

      if (ball.x > 0) {
        this.targetX = ball.x + this.currentMistakeX;
      } else {
        this.targetX = GameConfig.player2.xPos; // Return to baseline
      }
    }

    // --- 3. THE EYES (Smoothly drift focus) ---
    // On Hard mode (0ms delay), we let it lerp faster so it feels snappy and responsive
    const lerpSpeed = this.reactionDelayMs === 0 ? 0.3 : 0.15;
    this.focusZ += (this.targetZ - this.focusZ) * lerpSpeed;
    this.focusX += (this.targetX - this.focusX) * lerpSpeed;

    // --- 4. THE MUSCLES ---
    const deadzoneZ = 0.3;
    if (this.focusZ > paddle.z + deadzoneZ) inputs.ArrowDown = true;
    else if (this.focusZ < paddle.z - deadzoneZ) inputs.ArrowUp = true;

    const deadzoneX = 0.2;
    if (this.focusX < paddle.x - deadzoneX) inputs.ArrowLeft = true;
    else if (this.focusX > paddle.x + deadzoneX) inputs.ArrowRight = true;

    return inputs;
  }
}
