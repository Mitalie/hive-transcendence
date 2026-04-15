import { GameConfig } from "@/game/GameConfig";
import { GameType } from "@/game/GameState";

const PADDLE_Y = GameConfig.paddle.height / 2;
const EFFECTIVE_Z_LIMIT = GameConfig.court.zLimit - GameConfig.ball.radius;

export class PongEngine {
  public ball = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, spin: 0 };

  public p1 = { x: GameConfig.player1.xPos, y: PADDLE_Y, z: 0, vx: 0, vz: 0 };
  public p2 = { x: GameConfig.player2.xPos, y: PADDLE_Y, z: 0, vx: 0, vz: 0 };

  public serveTimer = 0;
  private nextServeDirection: 1 | 2 = 1;
  private onScore: (player: 1 | 2) => void;
  public mode: GameType;

  constructor(onScore: (player: 1 | 2) => void, mode: GameType) {
    this.onScore = onScore;
    this.mode = mode;
    this.initializeBall(1, false);
  }

  public update(delta: number, keys: Record<string, boolean>) {
    // Clamping protects against Division-by-Zero and physics tunneling during frame drops.
    const safeDelta = Math.max(
      0.0001,
      Math.min(delta, GameConfig.physics.maxDelta),
    );

    if (this.mode === "classic") {
      this.updateClassicPaddles(safeDelta, keys);
    } else {
      this.updateAdvancedPaddles(safeDelta, keys);
    }

    if (this.serveTimer > 0) {
      this.serveTimer -= safeDelta * 1000;

      if (this.ball.vx !== 0 || this.ball.vz !== 0) {
        this.ball.x += this.ball.vx * safeDelta;
        this.ball.z += this.ball.vz * safeDelta;

        if (this.mode === "advanced") {
          this.ball.vy -= GameConfig.ball.gravity * safeDelta;
          this.ball.y += this.ball.vy * safeDelta;
          this.ball.vz += this.ball.spin * safeDelta;
          this.ball.vz = Math.max(
            Math.min(this.ball.vz, GameConfig.ball.maxZVelocity),
            -GameConfig.ball.maxZVelocity,
          );
        }
      }

      if (this.serveTimer <= 0) {
        this.serveTimer = 0;
        this.initializeBall(this.nextServeDirection, true);
      }
      return;
    }

    if (this.mode === "classic") {
      this.updateClassicBall(safeDelta);
    } else {
      this.updateAdvancedBall(safeDelta);
    }

    this.checkPaddle(this.p1, 1, safeDelta);
    this.checkPaddle(this.p2, 2, safeDelta);

    this.resolveStaticBoundaries();

    if (this.ball.x > GameConfig.court.xLimit) {
      this.onScore(1);
      this.nextServeDirection = 2;
      this.serveTimer = GameConfig.rules.serveDelay;
    } else if (this.ball.x < -GameConfig.court.xLimit) {
      this.onScore(2);
      this.nextServeDirection = 1;
      this.serveTimer = GameConfig.rules.serveDelay;
    }
  }

  private updateClassicPaddles(delta: number, keys: Record<string, boolean>) {
    const speed = GameConfig.paddle.maxVelocity;
    const zLimit = GameConfig.paddle.zLimit;
    const p1Keys = GameConfig.player1.controls;
    const p2Keys = GameConfig.player2.controls;

    if (keys[p1Keys.up]) this.p1.z -= speed * delta;
    else if (keys[p1Keys.down]) this.p1.z += speed * delta;

    if (keys[p2Keys.up]) this.p2.z -= speed * delta;
    else if (keys[p2Keys.down]) this.p2.z += speed * delta;

    this.p1.z = Math.max(Math.min(this.p1.z, zLimit), -zLimit);
    this.p2.z = Math.max(Math.min(this.p2.z, zLimit), -zLimit);
  }

  private updateAdvancedPaddles(delta: number, keys: Record<string, boolean>) {
    const {
      acceleration: accel,
      friction: fric,
      maxVelocity: maxVel,
      zLimit,
    } = GameConfig.paddle;
    const p1Keys = GameConfig.player1.controls;
    const p2Keys = GameConfig.player2.controls;

    if (keys[p1Keys.up]) this.p1.vz -= accel * delta;
    else if (keys[p1Keys.down]) this.p1.vz += accel * delta;
    else this.p1.vz *= 1 - fric * delta;

    if (keys[p1Keys.left]) this.p1.vx -= accel * delta;
    else if (keys[p1Keys.right]) this.p1.vx += accel * delta;
    else this.p1.vx *= 1 - fric * delta;

    if (keys[p2Keys.up]) this.p2.vz -= accel * delta;
    else if (keys[p2Keys.down]) this.p2.vz += accel * delta;
    else this.p2.vz *= 1 - fric * delta;

    if (keys[p2Keys.left]) this.p2.vx -= accel * delta;
    else if (keys[p2Keys.right]) this.p2.vx += accel * delta;
    else this.p2.vx *= 1 - fric * delta;

    this.p1.vz = Math.max(Math.min(this.p1.vz, maxVel), -maxVel);
    this.p1.vx = Math.max(Math.min(this.p1.vx, maxVel), -maxVel);
    this.p2.vz = Math.max(Math.min(this.p2.vz, maxVel), -maxVel);
    this.p2.vx = Math.max(Math.min(this.p2.vx, maxVel), -maxVel);

    this.p1.z = Math.max(
      Math.min(this.p1.z + this.p1.vz * delta, zLimit),
      -zLimit,
    );
    this.p1.x = Math.max(
      -GameConfig.paddle.xMax,
      Math.min(-GameConfig.paddle.xMin, this.p1.x + this.p1.vx * delta),
    );
    this.p2.z = Math.max(
      Math.min(this.p2.z + this.p2.vz * delta, zLimit),
      -zLimit,
    );
    this.p2.x = Math.max(
      GameConfig.paddle.xMin,
      Math.min(GameConfig.paddle.xMax, this.p2.x + this.p2.vx * delta),
    );
  }

  private updateClassicBall(delta: number) {
    this.ball.x += this.ball.vx * delta;
    this.ball.z += this.ball.vz * delta;
    this.ball.y = GameConfig.ball.radius;
  }

  private updateAdvancedBall(delta: number) {
    this.ball.x += this.ball.vx * delta;
    this.ball.z += this.ball.vz * delta;
    this.ball.vy -= GameConfig.ball.gravity * delta;
    this.ball.y += this.ball.vy * delta;

    this.ball.vz += this.ball.spin * delta;
    this.ball.vz = Math.max(
      Math.min(this.ball.vz, GameConfig.ball.maxZVelocity),
      -GameConfig.ball.maxZVelocity,
    );

    this.ball.spin *= 1 - GameConfig.ball.spinFriction * delta;
  }

  private resolveStaticBoundaries() {
    if (this.mode === "advanced" && this.ball.y <= GameConfig.ball.radius) {
      this.ball.y = GameConfig.ball.radius;
      if (this.ball.vy < 0)
        this.ball.vy = -this.ball.vy * GameConfig.ball.bounceFriction;
    }

    if (this.ball.z >= EFFECTIVE_Z_LIMIT) {
      this.ball.z = EFFECTIVE_Z_LIMIT;
      if (this.ball.vz > 0) this.ball.vz *= -1;
    } else if (this.ball.z <= -EFFECTIVE_Z_LIMIT) {
      this.ball.z = -EFFECTIVE_Z_LIMIT;
      if (this.ball.vz < 0) this.ball.vz *= -1;
    }
  }

  private checkPaddle(paddle: typeof this.p1, player: 1 | 2, delta: number) {
    const r = GameConfig.ball.radius;
    const hitW = GameConfig.paddle.width / 2 + r;
    const hitD = GameConfig.paddle.depth / 2 + r;
    const hitH = GameConfig.paddle.height / 2 + r;

    const dx = this.ball.x - paddle.x;
    const dy = this.ball.y - PADDLE_Y;
    const dz = this.ball.z - paddle.z;

    const prevX = this.ball.x - this.ball.vx * delta;
    const planeX =
      player === 1
        ? paddle.x + GameConfig.paddle.width / 2 + r
        : paddle.x - GameConfig.paddle.width / 2 - r;

    let hitFrontFace = false;

    // Continuous Collision Detection: Prevents tunneling by checking the interpolated trajectory against the X-plane.
    if (
      Math.abs(dz) < GameConfig.paddle.depth / 2 &&
      Math.abs(dy) < GameConfig.paddle.height / 2
    ) {
      const denom = this.ball.x - prevX;
      if (Math.abs(denom) > 0.0001) {
        if (
          (player === 1 &&
            this.ball.vx < 0 &&
            prevX >= planeX &&
            this.ball.x <= planeX) ||
          (player === 2 &&
            this.ball.vx > 0 &&
            prevX <= planeX &&
            this.ball.x >= planeX)
        ) {
          hitFrontFace = true;
        }
      }
    }

    // Minkowski Penetration Resolver for non-CCD impacts.
    if (
      Math.abs(dx) < hitW &&
      Math.abs(dy) < hitH &&
      Math.abs(dz) < hitD &&
      !hitFrontFace
    ) {
      const penX = hitW - Math.abs(dx);
      const penY = hitH - Math.abs(dy);
      const penZ = hitD - Math.abs(dz);

      if (penX <= penY && penX <= penZ) {
        if ((player === 1 && dx > 0) || (player === 2 && dx < 0))
          hitFrontFace = true;
        else {
          this.ball.vx *= -1;
          this.ball.x = dx > 0 ? paddle.x + hitW : paddle.x - hitW;
        }
      } else if (penZ < penX && penZ <= penY) {
        if ((dz > 0 && this.ball.vz < 0) || (dz < 0 && this.ball.vz > 0)) {
          this.ball.vz *= -1;
          this.ball.z = dz > 0 ? paddle.z + hitD : paddle.z - hitD;
        }
      } else {
        if ((dy > 0 && this.ball.vy < 0) || (dy < 0 && this.ball.vy > 0)) {
          this.ball.vy *= -GameConfig.ball.bounceFriction;
          this.ball.y = dy > 0 ? PADDLE_Y + hitH : PADDLE_Y - hitH;
        }
      }
    }

    if (hitFrontFace) {
      const newVX =
        (player === 1 ? Math.abs(this.ball.vx) : -Math.abs(this.ball.vx)) +
        paddle.vx * GameConfig.physics.paddleVelocityTransfer;
      this.ball.vx = Math.max(
        Math.min(newVX, GameConfig.ball.maxXVelocity),
        -GameConfig.ball.maxXVelocity,
      );
      this.ball.x =
        player === 1
          ? paddle.x + hitW + GameConfig.physics.collisionNudge
          : paddle.x - hitW - GameConfig.physics.collisionNudge;
      const hitPoint = dz / (GameConfig.paddle.depth / 2);
      this.ball.vz += hitPoint * GameConfig.ball.deflectionBoost;

      if (this.mode === "advanced") {
        const newSpin =
          this.ball.spin * -GameConfig.physics.spinDecayOnHit -
          paddle.vz * GameConfig.ball.swipeSpinFactor;
        this.ball.spin = Math.max(
          Math.min(newSpin, GameConfig.ball.maxSpin),
          -GameConfig.ball.maxSpin,
        );
        this.ball.vy = GameConfig.ball.paddleHitForceY;
      }
    }
  }

  private initializeBall(targetPlayer: 1 | 2, launch: boolean) {
    this.serveTimer = launch ? 0 : GameConfig.rules.serveDelay;
    this.nextServeDirection = targetPlayer;

    this.ball.x = 0;
    this.ball.y =
      this.mode === "classic"
        ? GameConfig.ball.radius
        : GameConfig.ball.serveHeight;
    this.ball.z = 0;

    if (launch) {
      this.ball.vx =
        (this.nextServeDirection === 1 ? -1 : 1) *
        GameConfig.ball.startVelocityX;
      this.ball.vz =
        (Math.random() > 0.5 ? 1 : -1) * GameConfig.ball.startVelocityZ;
      this.ball.vy = 0;
      this.ball.spin = 0;
    } else {
      this.ball.vx = 0;
      this.ball.vz = 0;
      this.ball.vy = 0;
      this.ball.spin = 0;
    }
  }

  public destroy() {}
}

export type BallData = PongEngine["ball"];
export type PaddleData = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
};
