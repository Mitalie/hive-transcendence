import { GameConfig } from "./GameConfig";

export class PongEngine {
  public ball = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, spin: 0 };

  public p1 = { x: GameConfig.player1.xPos, z: 0, vx: 0, vz: 0 };
  public p2 = { x: GameConfig.player2.xPos, z: 0, vx: 0, vz: 0 };

  public serveTimer = 0;
  private nextServeDirection: 1 | 2 = 1;
  private onScore: (player: 1 | 2) => void;

  constructor(onScore: (player: 1 | 2) => void) {
    this.onScore = onScore;
    this.resetBall(1);
  }

  public update(
    delta: number,
    keys: Record<string, boolean>,
    gameState: string,
  ) {
    if (gameState !== "PLAYING") return;

    const safeDelta = Math.min(delta, 0.1);

    if (this.serveTimer > 0) {
      this.serveTimer -= safeDelta * 1000;
      this.ball.y = GameConfig.ball.serveHeight;
      return;
    }

    const accel = GameConfig.paddle.acceleration;
    const fric = GameConfig.paddle.friction;
    const maxVel = GameConfig.paddle.maxVelocity;
    const zLimit = GameConfig.paddle.zLimit;
    const xLimitBack = GameConfig.court.xLimit - 1;
    const netLimit = 1;

    // --- P1 Momentum Physics (WASD) ---
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

    // --- P2 Momentum Physics (Arrows) ---
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

    // --- Ball Movement ---
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

    // Pass dynamic X positions and X velocities into collision checks
    this.checkPaddle(this.p1.z, this.p1.x, 1, this.p1.vz, this.p1.vx);
    this.checkPaddle(this.p2.z, this.p2.x, 2, this.p2.vz, this.p2.vx);

    // Scoring
    if (this.ball.x > GameConfig.court.xLimit) {
      this.onScore(1);
      this.resetBall(2);
    } else if (this.ball.x < -GameConfig.court.xLimit) {
      this.onScore(2);
      this.resetBall(1);
    }
  }

  private checkPaddle(
    paddleZ: number,
    paddleX: number,
    player: number,
    paddleVelocityZ: number,
    paddleVelocityX: number,
  ) {
    const hitBoxDepth = GameConfig.paddle.depth / 2 + GameConfig.ball.radius;
    const hitBoxWidth = GameConfig.paddle.width / 2 + GameConfig.ball.radius;
    const hitBoxHeight = GameConfig.paddle.height / 2 + GameConfig.ball.radius;

    const bx = this.ball.x;
    const by = this.ball.y;
    const bz = this.ball.z;

    if (player === 1) {
      if (
        bx <= paddleX + hitBoxWidth &&
        bx >= paddleX - hitBoxWidth &&
        bz >= paddleZ - hitBoxDepth &&
        bz <= paddleZ + hitBoxDepth &&
        by <= hitBoxHeight
      ) {
        const smashPower = Math.abs(paddleVelocityX) * 0.5;
        this.ball.vx = Math.abs(this.ball.vx) + smashPower;
        this.ball.x = paddleX + hitBoxWidth + 0.1;
        this.applyDeflection(paddleZ, paddleVelocityZ);
      }
    } else {
      if (
        bx >= paddleX - hitBoxWidth &&
        bx <= paddleX + hitBoxWidth &&
        bz >= paddleZ - hitBoxDepth &&
        bz <= paddleZ + hitBoxDepth &&
        by <= hitBoxHeight
      ) {
        const smashPower = Math.abs(paddleVelocityX) * 0.5;
        this.ball.vx = -Math.abs(this.ball.vx) - smashPower;
        this.ball.x = paddleX - hitBoxWidth - 0.1;
        this.applyDeflection(paddleZ, paddleVelocityZ);
      }
    }
  }

  private applyDeflection(paddleZ: number, paddleVelocityZ: number) {
    const hitPoint = (this.ball.z - paddleZ) / (GameConfig.paddle.depth / 2);
    const spinBite = this.ball.spin * 0.5;

    this.ball.vz += hitPoint * GameConfig.ball.deflectionBoost + spinBite;
    this.ball.spin =
      this.ball.spin * -0.5 +
      paddleVelocityZ * GameConfig.ball.swipeSpinFactor * -1;

    this.ball.vy = GameConfig.ball.paddleHitForceY;

    const maxZ = GameConfig.ball.maxZVelocity;
    this.ball.vz = Math.max(Math.min(this.ball.vz, maxZ), -maxZ);
  }

  private resetBall(targetPlayer: 1 | 2) {
    this.ball.x = 0;
    this.ball.y = GameConfig.ball.serveHeight;
    this.ball.z = 0;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.vz = 0;
    this.ball.spin = 0;
    this.serveTimer = GameConfig.rules.serveDelay;

    this.nextServeDirection = targetPlayer;

    const randomZ = Math.random() > 0.5 ? 1 : -1;
    this.ball.vx =
      this.nextServeDirection === 1
        ? -GameConfig.ball.startVelocityX
        : GameConfig.ball.startVelocityX;
    this.ball.vz = GameConfig.ball.startVelocityZ * randomZ;
  }
}
