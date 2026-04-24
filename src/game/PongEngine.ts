import { GameConfig } from "@/game/GameConfig";
import { GameType } from "@/game/GameState";

export class PongEngine {
  public ball = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, spin: 0 };

  public p1: PaddleData;
  public p2: PaddleData;

  public serveTimer = 0;
  private nextServeDirection: 1 | 2 = 1;
  private onScore: (player: 1 | 2) => void;
  public mode: GameType;

  // Dynamic constants evaluated at match start to respect any GameConfig mutations
  private PADDLE_Y: number;
  private EFFECTIVE_Z_LIMIT: number;
  private CEILING: number;

  constructor(onScore: (player: 1 | 2) => void, mode: GameType) {
    this.onScore = onScore;
    this.mode = mode;

    // Evaluate physics limits dynamically based on current settings
    this.PADDLE_Y = GameConfig.paddle.height / 2;
    this.EFFECTIVE_Z_LIMIT = GameConfig.court.zLimit - GameConfig.ball.radius;
    // Invisible stratosphere ceiling to allow high lobs without camera overshoot
    this.CEILING = GameConfig.court.wallHeight * 3;

    this.p1 = {
      x: GameConfig.player1.xPos,
      y: this.PADDLE_Y,
      z: 0,
      vx: 0,
      vz: 0,
    };
    this.p2 = {
      x: GameConfig.player2.xPos,
      y: this.PADDLE_Y,
      z: 0,
      vx: 0,
      vz: 0,
    };

    this.initializeBall(1, false);
  }

  // The main update loop acting as the Sub-stepping Manager
  public update(delta: number, keys: Record<string, boolean>) {
    const safeDelta = Math.max(0.0001, Math.min(delta, 0.1));
    const TIME_STEP = 1 / 120;
    let timeAccumulator = safeDelta;

    while (timeAccumulator > 0) {
      const stepDelta = Math.min(timeAccumulator, TIME_STEP);
      this.stepPhysics(stepDelta, keys);
      timeAccumulator -= stepDelta;
    }
  }

  private stepPhysics(delta: number, keys: Record<string, boolean>) {
    if (this.mode === "classic") {
      this.updateClassicPaddles(delta, keys);
    } else {
      this.updateAdvancedPaddles(delta, keys);
    }

    if (this.serveTimer > 0) {
      this.serveTimer -= delta * 1000;

      // Maintain ball motion and boundary checks during the serve delay point-scoring sequence
      if (this.ball.vx !== 0 || this.ball.vz !== 0) {
        this.ball.x += this.ball.vx * delta;
        this.ball.z += this.ball.vz * delta;

        if (this.mode === "advanced") {
          this.ball.vy -= GameConfig.ball.gravity * delta;
          this.ball.y += this.ball.vy * delta;
          this.ball.vz += this.ball.spin * delta;
          this.ball.vz = Math.max(
            Math.min(this.ball.vz, GameConfig.ball.maxZVelocity),
            -GameConfig.ball.maxZVelocity,
          );
        }

        this.resolveStaticBoundaries();
      }

      if (this.serveTimer <= 0) {
        this.serveTimer = 0;
        this.initializeBall(this.nextServeDirection, true);
      }
      return;
    }

    if (this.mode === "classic") {
      this.updateClassicBall(delta);
    } else {
      this.updateAdvancedBall(delta);
    }

    this.checkPaddle(this.p1, 1, delta);
    this.checkPaddle(this.p2, 2, delta);

    this.resolveStaticBoundaries();

    // Goal line detection
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

    // Explicitly set velocities so Classic Mode hooks into Relative CCD correctly
    this.p1.vz = 0;
    if (keys[p1Keys.up]) this.p1.vz = -speed;
    else if (keys[p1Keys.down]) this.p1.vz = speed;

    this.p2.vz = 0;
    if (keys[p2Keys.up]) this.p2.vz = -speed;
    else if (keys[p2Keys.down]) this.p2.vz = speed;

    this.p1.vx = 0;
    this.p2.vx = 0;

    // Player 1 Z limits and Phantom Momentum prevention
    const nextP1Z = this.p1.z + this.p1.vz * delta;
    if (nextP1Z >= zLimit) {
      this.p1.z = zLimit;
      this.p1.vz = 0;
    } else if (nextP1Z <= -zLimit) {
      this.p1.z = -zLimit;
      this.p1.vz = 0;
    } else {
      this.p1.z = nextP1Z;
    }

    // Player 2 Z limits and Phantom Momentum prevention
    const nextP2Z = this.p2.z + this.p2.vz * delta;
    if (nextP2Z >= zLimit) {
      this.p2.z = zLimit;
      this.p2.vz = 0;
    } else if (nextP2Z <= -zLimit) {
      this.p2.z = -zLimit;
      this.p2.vz = 0;
    } else {
      this.p2.z = nextP2Z;
    }
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

    // Apply exponential decay friction to handle variable frame rates gracefully
    if (keys[p1Keys.up]) this.p1.vz -= accel * delta;
    else if (keys[p1Keys.down]) this.p1.vz += accel * delta;
    else this.p1.vz *= Math.exp(-fric * delta);

    if (keys[p1Keys.left]) this.p1.vx -= accel * delta;
    else if (keys[p1Keys.right]) this.p1.vx += accel * delta;
    else this.p1.vx *= Math.exp(-fric * delta);

    if (keys[p2Keys.up]) this.p2.vz -= accel * delta;
    else if (keys[p2Keys.down]) this.p2.vz += accel * delta;
    else this.p2.vz *= Math.exp(-fric * delta);

    if (keys[p2Keys.left]) this.p2.vx -= accel * delta;
    else if (keys[p2Keys.right]) this.p2.vx += accel * delta;
    else this.p2.vx *= Math.exp(-fric * delta);

    // Clamp absolute velocities
    this.p1.vz = Math.max(Math.min(this.p1.vz, maxVel), -maxVel);
    this.p1.vx = Math.max(Math.min(this.p1.vx, maxVel), -maxVel);
    this.p2.vz = Math.max(Math.min(this.p2.vz, maxVel), -maxVel);
    this.p2.vx = Math.max(Math.min(this.p2.vx, maxVel), -maxVel);

    // Calculate next positions and zero out velocity if hitting a wall bounds
    const nextP1Z = this.p1.z + this.p1.vz * delta;
    if (nextP1Z >= zLimit) {
      this.p1.z = zLimit;
      this.p1.vz = 0;
    } else if (nextP1Z <= -zLimit) {
      this.p1.z = -zLimit;
      this.p1.vz = 0;
    } else {
      this.p1.z = nextP1Z;
    }

    const nextP1X = this.p1.x + this.p1.vx * delta;
    if (nextP1X >= -GameConfig.paddle.xMin) {
      this.p1.x = -GameConfig.paddle.xMin;
      this.p1.vx = 0;
    } else if (nextP1X <= -GameConfig.paddle.xMax) {
      this.p1.x = -GameConfig.paddle.xMax;
      this.p1.vx = 0;
    } else {
      this.p1.x = nextP1X;
    }

    const nextP2Z = this.p2.z + this.p2.vz * delta;
    if (nextP2Z >= zLimit) {
      this.p2.z = zLimit;
      this.p2.vz = 0;
    } else if (nextP2Z <= -zLimit) {
      this.p2.z = -zLimit;
      this.p2.vz = 0;
    } else {
      this.p2.z = nextP2Z;
    }

    const nextP2X = this.p2.x + this.p2.vx * delta;
    if (nextP2X >= GameConfig.paddle.xMax) {
      this.p2.x = GameConfig.paddle.xMax;
      this.p2.vx = 0;
    } else if (nextP2X <= GameConfig.paddle.xMin) {
      this.p2.x = GameConfig.paddle.xMin;
      this.p2.vx = 0;
    } else {
      this.p2.x = nextP2X;
    }
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

    this.ball.spin *= Math.exp(-GameConfig.ball.spinFriction * delta);
  }

  private resolveStaticBoundaries() {
    if (this.mode === "advanced") {
      if (this.ball.y <= GameConfig.ball.radius) {
        this.ball.y = GameConfig.ball.radius;
        if (this.ball.vy < 0)
          this.ball.vy = -this.ball.vy * GameConfig.ball.bounceFriction;
      }
      // Ceiling bounds check to prevent camera overshoot
      else if (this.ball.y >= this.CEILING - GameConfig.ball.radius) {
        this.ball.y = this.CEILING - GameConfig.ball.radius;
        if (this.ball.vy > 0)
          this.ball.vy = -this.ball.vy * GameConfig.ball.bounceFriction;
      }
    }

    if (this.ball.z >= this.EFFECTIVE_Z_LIMIT) {
      this.ball.z = this.EFFECTIVE_Z_LIMIT;
      if (this.ball.vz > 0) this.ball.vz *= -1;
    } else if (this.ball.z <= -this.EFFECTIVE_Z_LIMIT) {
      this.ball.z = -this.EFFECTIVE_Z_LIMIT;
      if (this.ball.vz < 0) this.ball.vz *= -1;
    }
  }

  private checkPaddle(paddle: PaddleData, player: 1 | 2, delta: number) {
    const r = GameConfig.ball.radius;
    const hitW = GameConfig.paddle.width / 2 + r;
    const hitD = GameConfig.paddle.depth / 2 + r;
    const hitH = GameConfig.paddle.height / 2 + r;

    const dx = this.ball.x - paddle.x;
    const dy = this.ball.y - this.PADDLE_Y;
    const dz = this.ball.z - paddle.z;

    const prevX = this.ball.x - this.ball.vx * delta;
    const prevY = this.ball.y - this.ball.vy * delta;
    const prevZ = this.ball.z - this.ball.vz * delta;

    // Evaluate positions relative to the moving paddle frame of reference
    const prevPaddleX = paddle.x - paddle.vx * delta;
    const prevPaddleZ = paddle.z - paddle.vz * delta;

    const relPlaneX = player === 1 ? hitW : -hitW;
    const prevRelX = prevX - prevPaddleX;
    const currentRelX = this.ball.x - paddle.x;
    const relVX = this.ball.vx - paddle.vx;

    let hitFrontFace = false;
    let crossBallZ = this.ball.z;
    let crossPaddleZ_saved = paddle.z;

    // Relative Continuous Collision Detection (CCD)
    const denom = currentRelX - prevRelX;
    if (Math.abs(denom) > 0.0001) {
      const crossingT = (relPlaneX - prevRelX) / denom;
      if (crossingT >= 0 && crossingT <= 1.0) {
        const cBallZ = prevZ + (this.ball.z - prevZ) * crossingT;
        const cPaddleZ = prevPaddleZ + (paddle.z - prevPaddleZ) * crossingT;
        const cBallY = prevY + (this.ball.y - prevY) * crossingT;

        if (
          Math.abs(cBallZ - cPaddleZ) < hitD &&
          Math.abs(cBallY - this.PADDLE_Y) < hitH
        ) {
          if (
            (player === 1 &&
              relVX < 0 &&
              prevRelX >= relPlaneX &&
              currentRelX <= relPlaneX) ||
            (player === 2 &&
              relVX > 0 &&
              prevRelX <= relPlaneX &&
              currentRelX >= relPlaneX)
          ) {
            hitFrontFace = true;
            crossBallZ = cBallZ;
            crossPaddleZ_saved = cPaddleZ;
          }
        }
      }
    }

    // Minkowski Sum Penetration Resolver using Elastic Relative Reflection
    if (
      Math.abs(dx) < hitW &&
      Math.abs(dy) < hitH &&
      Math.abs(dz) < hitD &&
      !hitFrontFace
    ) {
      const penX = hitW - Math.abs(dx);
      const penY = hitH - Math.abs(dy);
      const penZ = hitD - Math.abs(dz);

      const relVZ = this.ball.vz - paddle.vz;

      if (penX <= penY && penX <= penZ) {
        if ((player === 1 && dx > 0) || (player === 2 && dx < 0))
          hitFrontFace = true;
        else if ((dx > 0 && relVX < 0) || (dx < 0 && relVX > 0)) {
          this.ball.vx = paddle.vx - relVX;
          this.ball.x = dx > 0 ? paddle.x + hitW : paddle.x - hitW;
        }
      } else if (penZ < penX && penZ <= penY) {
        if ((dz > 0 && relVZ < 0) || (dz < 0 && relVZ > 0)) {
          this.ball.vz = paddle.vz - relVZ;
          this.ball.z = dz > 0 ? paddle.z + hitD : paddle.z - hitD;
        }
      } else {
        if ((dy > 0 && this.ball.vy < 0) || (dy < 0 && this.ball.vy > 0)) {
          this.ball.vy *= -GameConfig.ball.bounceFriction;
          this.ball.y = dy > 0 ? this.PADDLE_Y + hitH : this.PADDLE_Y - hitH;
        }
      }
    }

    if (hitFrontFace) {
      let newVX =
        (player === 1 ? Math.abs(this.ball.vx) : -Math.abs(this.ball.vx)) +
        paddle.vx * GameConfig.physics.paddleVelocityTransfer;

      // Escape Velocity Guarantee
      if (player === 1) {
        newVX = Math.max(newVX, GameConfig.ball.startVelocityX);
        newVX = Math.max(newVX, paddle.vx + 5);
      } else {
        newVX = Math.min(newVX, -GameConfig.ball.startVelocityX);
        newVX = Math.min(newVX, paddle.vx - 5);
      }

      this.ball.vx = Math.max(
        Math.min(newVX, GameConfig.ball.maxXVelocity),
        -GameConfig.ball.maxXVelocity,
      );
      this.ball.x =
        player === 1
          ? paddle.x + hitW + GameConfig.physics.collisionNudge
          : paddle.x - hitW - GameConfig.physics.collisionNudge;

      const hitPoint =
        (crossBallZ - crossPaddleZ_saved) / (GameConfig.paddle.depth / 2);
      this.ball.vz += hitPoint * GameConfig.ball.deflectionBoost;

      this.ball.vz = Math.max(
        Math.min(this.ball.vz, GameConfig.ball.maxZVelocity),
        -GameConfig.ball.maxZVelocity,
      );

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
    this.ball.z = 0;

    const ceilingLimit = this.CEILING - GameConfig.ball.radius;
    this.ball.y =
      this.mode === "classic"
        ? GameConfig.ball.radius
        : Math.min(GameConfig.ball.serveHeight, ceilingLimit);

    if (launch) {
      this.ball.vx =
        (this.nextServeDirection === 1 ? -1 : 1) *
        GameConfig.ball.startVelocityX;
      const zMagnitude =
        GameConfig.ball.startVelocityZ * (0.8 + Math.random() * 0.4);
      this.ball.vz = (Math.random() > 0.5 ? 1 : -1) * zMagnitude;
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
