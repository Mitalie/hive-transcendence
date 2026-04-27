import { GameConfig } from "@/game/GameConfig";
import { GameType } from "@/game/GameState";

const CCD_DENOM_EPSILON = 0.0001;
const MIN_SAFE_DELTA = 0.0001;

export class PongEngine {
  public ball = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, spin: 0 };
  public p1: PaddleData;
  public p2: PaddleData;
  public serveTimer = 0;
  private nextServeDirection: 1 | 2 = 1;
  private onScore: (player: 1 | 2) => void;
  public mode: GameType;

  private PADDLE_Y: number;
  private EFFECTIVE_Z_LIMIT: number;
  private CEILING: number;
  private paddleMod: number;
  private DYNAMIC_PADDLE_Z_LIMIT: number;

  constructor(
    onScore: (player: 1 | 2) => void,
    mode: GameType,
    difficulty: "easy" | "medium" | "hard" = "medium",
  ) {
    this.onScore = onScore;
    this.mode = mode;

    const mods = GameConfig.difficultyModifiers[difficulty];
    this.paddleMod = mods.paddleSizeMultiplier;

    const currentPaddleDepth = GameConfig.paddle.depth * this.paddleMod;
    this.DYNAMIC_PADDLE_Z_LIMIT =
      GameConfig.court.zLimit - currentPaddleDepth / 2;

    this.PADDLE_Y = (GameConfig.paddle.height * this.paddleMod) / 2;
    this.EFFECTIVE_Z_LIMIT = GameConfig.court.zLimit - GameConfig.ball.radius;
    this.CEILING =
      GameConfig.court.wallHeight * GameConfig.court.physicsCeilingMultiplier;

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

  public update(delta: number, keys: Record<string, boolean>) {
    const safeDelta = Math.max(
      MIN_SAFE_DELTA,
      Math.min(delta, GameConfig.physics.maxDelta),
    );
    const TIME_STEP = 1 / GameConfig.physics.subStepHz;
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
    const zLimit = this.DYNAMIC_PADDLE_Z_LIMIT;
    const p1Keys = GameConfig.player1.controls;
    const p2Keys = GameConfig.player2.controls;

    this.p1.vz = keys[p1Keys.up] ? -speed : keys[p1Keys.down] ? speed : 0;
    this.p2.vz = keys[p2Keys.up] ? -speed : keys[p2Keys.down] ? speed : 0;
    this.p1.vx = this.p2.vx = 0;

    [this.p1, this.p2].forEach((p) => {
      const nextZ = p.z + p.vz * delta;
      if (Math.abs(nextZ) >= zLimit) {
        p.z = Math.sign(nextZ) * zLimit;
        p.vz = 0;
      } else {
        p.z = nextZ;
      }
    });
  }

  private updateAdvancedPaddles(delta: number, keys: Record<string, boolean>) {
    const {
      acceleration: accel,
      friction: fric,
      maxVelocity: maxVel,
    } = GameConfig.paddle;
    const zLimit = this.DYNAMIC_PADDLE_Z_LIMIT;
    const p1Keys = GameConfig.player1.controls;
    const p2Keys = GameConfig.player2.controls;

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

    [this.p1, this.p2].forEach((p) => {
      p.vz = Math.max(Math.min(p.vz, maxVel), -maxVel);
      p.vx = Math.max(Math.min(p.vx, maxVel), -maxVel);
      const nextZ = p.z + p.vz * delta;
      if (Math.abs(nextZ) >= zLimit) {
        p.z = Math.sign(nextZ) * zLimit;
        p.vz = 0;
      } else {
        p.z = nextZ;
      }
    });

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
      } else if (this.ball.y >= this.CEILING - GameConfig.ball.radius) {
        this.ball.y = this.CEILING - GameConfig.ball.radius;
        if (this.ball.vy > 0)
          this.ball.vy = -this.ball.vy * GameConfig.ball.bounceFriction;
      }
    }
    if (Math.abs(this.ball.z) >= this.EFFECTIVE_Z_LIMIT) {
      this.ball.z = Math.sign(this.ball.z) * this.EFFECTIVE_Z_LIMIT;
      this.ball.vz *= -GameConfig.ball.wallBounceFriction;
    }
  }

  private checkPaddle(paddle: PaddleData, player: 1 | 2, delta: number) {
    const r = GameConfig.ball.radius;
    const hitW = (GameConfig.paddle.width * this.paddleMod) / 2 + r;
    const hitD = (GameConfig.paddle.depth * this.paddleMod) / 2 + r;
    const hitH = (GameConfig.paddle.height * this.paddleMod) / 2 + r;

    const dx = this.ball.x - paddle.x;
    const dy = this.ball.y - this.PADDLE_Y;
    const dz = this.ball.z - paddle.z;

    const prevX = this.ball.x - this.ball.vx * delta;
    const prevY = this.ball.y - this.ball.vy * delta;
    const prevZ = this.ball.z - this.ball.vz * delta;
    const prevPaddleX = paddle.x - paddle.vx * delta;
    const prevPaddleZ = paddle.z - paddle.vz * delta;

    const relPlaneX = player === 1 ? hitW : -hitW;
    const prevRelX = prevX - prevPaddleX;
    const currentRelX = this.ball.x - paddle.x;
    const relVX = this.ball.vx - paddle.vx;

    let hitFrontFace = false;
    let crossBallZ = this.ball.z;
    let crossPaddleZ_saved = paddle.z;

    // Relative CCD to prevent tunneling through fast-moving paddles
    const denom = currentRelX - prevRelX;
    if (Math.abs(denom) > CCD_DENOM_EPSILON) {
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
            (player === 1 && relVX < 0 && prevRelX >= relPlaneX) ||
            (player === 2 && relVX > 0 && prevRelX <= relPlaneX)
          ) {
            hitFrontFace = true;
            crossBallZ = cBallZ;
            crossPaddleZ_saved = cPaddleZ;
          }
        }
      }
    }

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
        if ((player === 1 && dx > 0) || (player === 2 && dx < 0)) {
          hitFrontFace = true;
        } else {
          if ((dx > 0 && relVX < 0) || (dx < 0 && relVX > 0)) {
            this.ball.vx = paddle.vx - relVX;
            this.ball.x = dx > 0 ? paddle.x + hitW : paddle.x - hitW;
          }
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
      const buffer = GameConfig.physics.escapeVelocityBuffer;
      let newVX =
        (player === 1 ? Math.abs(this.ball.vx) : -Math.abs(this.ball.vx)) +
        paddle.vx * GameConfig.physics.paddleVelocityTransfer;

      if (player === 1) {
        newVX = Math.max(
          newVX,
          GameConfig.ball.startVelocityX,
          paddle.vx + buffer,
        );
      } else {
        newVX = Math.min(
          newVX,
          -GameConfig.ball.startVelocityX,
          paddle.vx - buffer,
        );
      }

      this.ball.vx = newVX;
      this.ball.x =
        player === 1
          ? paddle.x + hitW + GameConfig.physics.collisionNudge
          : paddle.x - hitW - GameConfig.physics.collisionNudge;

      const hitPoint =
        (crossBallZ - crossPaddleZ_saved) /
        ((GameConfig.paddle.depth * this.paddleMod) / 2);
      this.ball.vz += hitPoint * GameConfig.ball.deflectionBoost;

      // Vector normalization to preserve angle while strictly bounding total speed
      const currentSpeed = Math.sqrt(
        this.ball.vx * this.ball.vx + this.ball.vz * this.ball.vz,
      );
      const maxSpeed = GameConfig.ball.maxXVelocity;

      if (currentSpeed > maxSpeed) {
        const scale = maxSpeed / currentSpeed;
        this.ball.vx *= scale;
        this.ball.vz *= scale;
      }

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
      this.ball.vx = this.ball.vz = this.ball.vy = this.ball.spin = 0;
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
