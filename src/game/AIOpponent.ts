import { PongEngine } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export type AIDifficulty = "easy" | "medium" | "hard";

export class AIOpponent {
  private engine: PongEngine;

  // Defaults (Medium)
  private reactionDelayMs: number = 250;
  private errorMargin: number = 0.5;

  private lastThoughtTime: number = 0;
  private lastMistakeTime: number = 0; // Keeps mistakes stable

  private currentMistakeZ: number = 0;
  private currentMistakeX: number = 0;

  private targetZ: number = 0;
  private targetX: number = 0;

  private focusZ: number = 0;
  private focusX: number = 0;

  constructor(engine: PongEngine, difficulty: AIDifficulty) {
    this.engine = engine;
    switch (difficulty) {
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
      arrowup: false,
      arrowdown: false,
      arrowleft: false,
      arrowright: false,
    };

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

      // Lock in the Z target with the stable mistake offset
      this.targetZ = ball.z + this.currentMistakeZ;

      // Read the height! Can we actually hit this?
      const isBallTooHigh = ball.y > GameConfig.paddle.height;

      if (ball.x > 0) {
        if (isBallTooHigh) {
          // Lob detected! Backpedal towards the baseline to let it drop
          this.targetX = GameConfig.court.xLimit - 2;
        } else {
          // Normal shot, track it!
          this.targetX = ball.x + this.currentMistakeX;
        }
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
    if (this.focusZ > paddle.z + deadzoneZ) inputs.arrowdown = true;
    else if (this.focusZ < paddle.z - deadzoneZ) inputs.arrowup = true;

    const deadzoneX = 0.2;
    if (this.focusX < paddle.x - deadzoneX) inputs.arrowleft = true;
    else if (this.focusX > paddle.x + deadzoneX) inputs.arrowright = true;

    return inputs;
  }
}
