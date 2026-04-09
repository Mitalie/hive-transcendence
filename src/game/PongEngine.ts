import { GameConfig } from "./GameConfig";
import { GameType } from "./GameState";

export class PongEngine {
  public ball = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, spin: 0 };

  public p1 = { x: GameConfig.player1.xPos, z: 0, vx: 0, vz: 0 };
  public p2 = { x: GameConfig.player2.xPos, z: 0, vx: 0, vz: 0 };

  public serveTimer = 0;
  private nextServeDirection: 1 | 2 = 1;
  private onScore: (player: 1 | 2) => void;
  public mode: GameType;

  constructor(onScore: (player: 1 | 2) => void, mode: GameType) {
    this.onScore = onScore;
    this.mode = mode;
    this.resetBall(1);
  }

  public update(delta: number, keys: Record<string, boolean>) {
    const safeDelta = Math.min(delta, 0.1);

    if (this.serveTimer > 0) {
      this.serveTimer -= safeDelta * 1000;
      // Serve from the floor in classic, sky in advanced
      this.ball.y = this.mode === "classic" ? 0 : GameConfig.ball.serveHeight;
      return;
    }

    // --- MODE ROUTING ---
    if (this.mode === "classic") {
      this.updateClassicPhysics(safeDelta, keys);
    } else {
      this.updateAdvancedPhysics(safeDelta, keys);
    }

    // --- SHARED SCORING LOGIC ---
    if (this.ball.x > GameConfig.court.xLimit) {
      this.onScore(1);
      this.resetBall(2);
    } else if (this.ball.x < -GameConfig.court.xLimit) {
      this.onScore(2);
      this.resetBall(1);
    }
  }

  private updateClassicPhysics(
    safeDelta: number,
    keys: Record<string, boolean>,
  ) {
    const speed = GameConfig.paddle.maxVelocity; // Use max speed as flat speed
    const zLimit = GameConfig.paddle.zLimit;

    // Lock X positions, Reset velocities (No net-rushing or tilting in classic)
    this.p1.x = GameConfig.player1.xPos;
    this.p2.x = GameConfig.player2.xPos;
    this.p1.vx = 0;
    this.p1.vz = 0;
    this.p2.vx = 0;
    this.p2.vz = 0;

    // Binary Z-Axis Movement
    if (keys["w"]) this.p1.z -= speed * safeDelta;
    else if (keys["s"]) this.p1.z += speed * safeDelta;

    if (keys["arrowup"]) this.p2.z -= speed * safeDelta;
    else if (keys["arrowdown"]) this.p2.z += speed * safeDelta;

    this.p1.z = Math.max(Math.min(this.p1.z, zLimit), -zLimit);
    this.p2.z = Math.max(Math.min(this.p2.z, zLimit), -zLimit);

    // Flat 2D Ball Movement
    this.ball.x += this.ball.vx * safeDelta;
    this.ball.z += this.ball.vz * safeDelta;
    this.ball.y = 0;
    this.ball.vy = 0;
    this.ball.spin = 0;

    // Flat 2D Wall Collisions
    if (this.ball.z >= GameConfig.court.zLimit) {
      this.ball.vz = -Math.abs(this.ball.vz);
    } else if (this.ball.z <= -GameConfig.court.zLimit) {
      this.ball.vz = Math.abs(this.ball.vz);
    }

    // Check Paddles (Pass 0s so smashes and curve calculations are ignored)
    this.checkPaddle(this.p1.z, this.p1.x, 1, 0, 0);
    this.checkPaddle(this.p2.z, this.p2.x, 2, 0, 0);
  }

  private updateAdvancedPhysics(
    safeDelta: number,
    keys: Record<string, boolean>,
  ) {
    const accel = GameConfig.paddle.acceleration;
    const fric = GameConfig.paddle.friction;
    const maxVel = GameConfig.paddle.maxVelocity;
    const zLimit = GameConfig.paddle.zLimit;
    const xLimitBack = GameConfig.court.xLimit - 1;
    const netLimit = 1;

    // P1 Momentum
    if (keys["w"]) this.p1.vz -= accel * safeDelta;
    else if (keys["s"]) this.p1.vz += accel * safeDelta;
    else this.p1.vz *= 1 - fric * safeDelta;

    if (keys["a"]) this.p1.vx -= accel * safeDelta;
    else if (keys["d"]) this.p1.vx += accel * safeDelta;
    else this.p1.vx *= 1 - fric * safeDelta;

    this.p1.vz = Math.max(Math.min(this.p1.vz, maxVel), -maxVel);
    this.p1.z += this.p1.vz * safeDelta;
    if (this.p1.z >= zLimit) {
      this.p1.z = zLimit;
      this.p1.vz = 0;
    }
    if (this.p1.z <= -zLimit) {
      this.p1.z = -zLimit;
      this.p1.vz = 0;
    }

    this.p1.vx = Math.max(Math.min(this.p1.vx, maxVel), -maxVel);
    this.p1.x += this.p1.vx * safeDelta;
    if (this.p1.x <= -xLimitBack) {
      this.p1.x = -xLimitBack;
      this.p1.vx = 0;
    }
    if (this.p1.x >= -netLimit) {
      this.p1.x = -netLimit;
      this.p1.vx = 0;
    }

    // P2 Momentum
    if (keys["arrowup"]) this.p2.vz -= accel * safeDelta;
    else if (keys["arrowdown"]) this.p2.vz += accel * safeDelta;
    else this.p2.vz *= 1 - fric * safeDelta;

    if (keys["arrowleft"]) this.p2.vx -= accel * safeDelta;
    else if (keys["arrowright"]) this.p2.vx += accel * safeDelta;
    else this.p2.vx *= 1 - fric * safeDelta;

    this.p2.vz = Math.max(Math.min(this.p2.vz, maxVel), -maxVel);
    this.p2.z += this.p2.vz * safeDelta;
    if (this.p2.z >= zLimit) {
      this.p2.z = zLimit;
      this.p2.vz = 0;
    }
    if (this.p2.z <= -zLimit) {
      this.p2.z = -zLimit;
      this.p2.vz = 0;
    }

    this.p2.vx = Math.max(Math.min(this.p2.vx, maxVel), -maxVel);
    this.p2.x += this.p2.vx * safeDelta;
    if (this.p2.x >= xLimitBack) {
      this.p2.x = xLimitBack;
      this.p2.vx = 0;
    }
    if (this.p2.x <= netLimit) {
      this.p2.x = netLimit;
      this.p2.vx = 0;
    }

    // Ball Movement
    this.ball.x += this.ball.vx * safeDelta;
    this.ball.z += this.ball.vz * safeDelta;

    // 3D Gravity
    this.ball.vy -= GameConfig.ball.gravity * safeDelta;
    this.ball.y += this.ball.vy * safeDelta;
    if (this.ball.y <= 0) {
      this.ball.y = 0;
      this.ball.vy = Math.abs(this.ball.vy) * GameConfig.ball.bounceFriction;
    }

    // Magnus Curve
    this.ball.vz += this.ball.spin * safeDelta;
    this.ball.spin *= 1 - GameConfig.ball.spinFriction * safeDelta;
    const maxZBall = GameConfig.ball.maxZVelocity;
    this.ball.vz = Math.max(Math.min(this.ball.vz, maxZBall), -maxZBall);

    // True 3D Wall Collisions
    const wallHitBoxHeight = GameConfig.court.wallHeight;
    if (
      this.ball.z >= GameConfig.court.zLimit &&
      this.ball.y <= wallHitBoxHeight
    ) {
      this.ball.vz = -Math.abs(this.ball.vz);
      this.ball.spin *= 0.9;
    } else if (
      this.ball.z <= -GameConfig.court.zLimit &&
      this.ball.y <= wallHitBoxHeight
    ) {
      this.ball.vz = Math.abs(this.ball.vz);
      this.ball.spin *= 0.9;
    }

    this.checkPaddle(this.p1.z, this.p1.x, 1, this.p1.vz, this.p1.vx);
    this.checkPaddle(this.p2.z, this.p2.x, 2, this.p2.vz, this.p2.vx);
  }

  private checkPaddle(
    paddleZ: number,
    paddleX: number,
    player: number,
    paddleVelocityZ: number,
    paddleVelocityX: number,
  ) {
    // We define a thinner "Front Face" hit-box to prevent side-warping
    const hitBoxDepth = GameConfig.paddle.depth / 2 + GameConfig.ball.radius;
    const hitBoxWidth = GameConfig.paddle.width / 2 + GameConfig.ball.radius;
    const hitBoxHeight = GameConfig.paddle.height / 2 + GameConfig.ball.radius;

    const bx = this.ball.x;
    const by = this.ball.y;
    const bz = this.ball.z;

    // 1. REGION CHECK: Is the ball even near the paddle?
    const isInsideX =
      bx <= paddleX + hitBoxWidth && bx >= paddleX - hitBoxWidth;
    const isInsideZ =
      bz >= paddleZ - hitBoxDepth && bz <= paddleZ + hitBoxDepth;
    const isInsideY = by <= hitBoxHeight;

    if (isInsideX && isInsideZ && isInsideY) {
      // 2. FACE DIRECTION LOGIC:
      // Player 1's "Front" is the Right side (+X). Player 2's "Front" is the Left side (-X).
      const isBallInFront = player === 1 ? bx > paddleX : bx < paddleX;

      if (this.mode === "advanced") {
        // ADVANCED: Full Newtonian Physics

        // Only "Bounce" if the ball is hitting the front face and moving towards it
        const isApproaching =
          (player === 1 && this.ball.vx < 0) ||
          (player === 2 && this.ball.vx > 0);

        if (isBallInFront && isApproaching) {
          // Reflect the incoming speed and add momentum transfer
          this.ball.vx = -this.ball.vx;
          this.ball.vx += paddleVelocityX * 0.8;

          // Push out to the front face to prevent stuck-loop
          const pushDir = player === 1 ? 1 : -1;
          this.ball.x = paddleX + hitBoxWidth * pushDir + 0.1 * pushDir;
        } else if (!isBallInFront) {
          // Body Hit: Ball is pushed by the paddle velocity instead of bouncing
          this.ball.vx = paddleVelocityX * 1.2;

          // Snap to the current side to prevent warping through middle
          const sideDir = bx > paddleX ? 1 : -1;
          this.ball.x = paddleX + hitBoxWidth * sideDir + 0.1 * sideDir;
        }
      } else {
        // CLASSIC: Arcade Snapping (The "Cheat" Mode)
        if (player === 1) {
          this.ball.vx = Math.abs(this.ball.vx);
          this.ball.x = paddleX + hitBoxWidth + 0.1;
        } else {
          this.ball.vx = -Math.abs(this.ball.vx);
          this.ball.x = paddleX - hitBoxWidth - 0.1;
        }
      }

      // Apply vertical/spin deflection
      this.applyDeflection(paddleZ, paddleVelocityZ);
    }
  }

  private applyDeflection(paddleZ: number, paddleVelocityZ: number) {
    const hitPoint = (this.ball.z - paddleZ) / (GameConfig.paddle.depth / 2);

    // 1. BASE BOUNCE (Applies to both modes)
    this.ball.vz += hitPoint * GameConfig.ball.deflectionBoost;

    if (this.mode === "advanced") {
      // 2. CYBER PADEL ONLY (Spin bite, Pop-up)
      const spinBite = this.ball.spin * 0.5;
      this.ball.vz += spinBite;

      this.ball.spin =
        this.ball.spin * -0.5 +
        paddleVelocityZ * GameConfig.ball.swipeSpinFactor * -1;
      this.ball.vy = GameConfig.ball.paddleHitForceY;
    } else {
      // 3. CLASSIC ONLY (Clean state)
      this.ball.spin = 0;
      this.ball.vy = 0;
    }

    const maxZ = GameConfig.ball.maxZVelocity;
    this.ball.vz = Math.max(Math.min(this.ball.vz, maxZ), -maxZ);
  }

  private resetBall(targetPlayer: 1 | 2) {
    this.ball.x = 0;
    this.ball.z = 0;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vz = 0;
    this.ball.spin = 0;

    // Drop height depends on mode
    this.ball.y = this.mode === "classic" ? 0 : GameConfig.ball.serveHeight;
    this.serveTimer = GameConfig.rules.serveDelay;

    this.nextServeDirection = targetPlayer;

    const speedMultiplier = this.mode === "classic" ? 2 : 0.5;
    const randomZ = Math.random() > 0.5 ? 1 : -1;
    this.ball.vx =
      this.nextServeDirection === 1
        ? -GameConfig.ball.startVelocityX
        : GameConfig.ball.startVelocityX * speedMultiplier;
    this.ball.vz = GameConfig.ball.startVelocityZ * randomZ * speedMultiplier;
  }
}

export type BallData = PongEngine["ball"];
export type PaddleData = PongEngine["p1"];
