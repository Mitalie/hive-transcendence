import { GameConfig } from "./GameConfig";

export class PongEngine {
  public ball = { x: 0, z: 0, vx: 0, vz: 0 };
  public p1 = { z: 0 };
  public p2 = { z: 0 };
  public serveTimer = 0;
  private nextServeDirection: 1 | 2 = 1;
  private onScore: (player: 1 | 2) => void;

  constructor(onScore: (player: 1 | 2) => void) {
    this.onScore = onScore;

    // Initial random serve direction (X and Z)
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirZ = Math.random() > 0.5 ? 1 : -1;

    this.ball.x = 0;
    this.ball.z = 0;
    this.ball.vx = GameConfig.ball.startVelocityX * dirX;
    this.ball.vz = GameConfig.ball.startVelocityZ * dirZ;

    // Start with the initial delay
    this.serveTimer = GameConfig.rules.serveDelay;
  }

  public update(
    delta: number,
    keys: Record<string, boolean>,
    gameState: string,
  ) {
    if (gameState !== "PLAYING") return;

    const safeDelta = Math.min(delta, 0.1);

    // Serve Delay Logic
    if (this.serveTimer > 0) {
      this.serveTimer -= safeDelta * 1000;
      // When timer hits 0, the velocities set in constructor (or resetBall) take over
      return;
    }

    const speed = GameConfig.paddle.speed;
    const limit = GameConfig.paddle.zLimit;

    // Paddle Movement
    if (keys["w"]) this.p1.z -= speed * safeDelta;
    if (keys["s"]) this.p1.z += speed * safeDelta;
    this.p1.z = Math.max(Math.min(this.p1.z, limit), -limit);

    if (keys["arrowup"]) this.p2.z -= speed * safeDelta;
    if (keys["arrowdown"]) this.p2.z += speed * safeDelta;
    this.p2.z = Math.max(Math.min(this.p2.z, limit), -limit);

    // Ball Movement
    this.ball.x += this.ball.vx * safeDelta;
    this.ball.z += this.ball.vz * safeDelta;

    // Wall Collisions
    if (this.ball.z >= GameConfig.court.zLimit) {
      this.ball.vz = -Math.abs(this.ball.vz);
    } else if (this.ball.z <= -GameConfig.court.zLimit) {
      this.ball.vz = Math.abs(this.ball.vz);
    }

    // Paddle Collisions
    this.checkPaddle(this.p1.z, GameConfig.player1.xPos, 1);
    this.checkPaddle(this.p2.z, GameConfig.player2.xPos, 2);

    // Scoring
    if (this.ball.x > GameConfig.court.xLimit) {
      this.onScore(1);
      this.resetBall(2);
    } else if (this.ball.x < -GameConfig.court.xLimit) {
      this.onScore(2);
      this.resetBall(1);
    }
  }

  private checkPaddle(paddleZ: number, paddleX: number, player: number) {
    const hitBoxDepth = GameConfig.paddle.depth / 2 + GameConfig.ball.radius;
    const bx = this.ball.x;
    const bz = this.ball.z;

    if (player === 1) {
      if (
        bx <= paddleX + 0.5 &&
        bx >= paddleX &&
        bz >= paddleZ - hitBoxDepth &&
        bz <= paddleZ + hitBoxDepth
      ) {
        this.ball.vx = Math.abs(this.ball.vx);
        this.ball.x = paddleX + 0.6;
        this.applyDeflection(paddleZ);
      }
    } else {
      if (
        bx >= paddleX - 0.5 &&
        bx <= paddleX &&
        bz >= paddleZ - hitBoxDepth &&
        bz <= paddleZ + hitBoxDepth
      ) {
        this.ball.vx = -Math.abs(this.ball.vx);
        this.ball.x = paddleX - 0.6;
        this.applyDeflection(paddleZ);
      }
    }
  }

  private applyDeflection(paddleZ: number) {
    const hitPoint = (this.ball.z - paddleZ) / (GameConfig.paddle.depth / 2);
    this.ball.vz += hitPoint * GameConfig.ball.deflectionBoost;
    const maxZ = GameConfig.ball.maxZVelocity;
    this.ball.vz = Math.max(Math.min(this.ball.vz, maxZ), -maxZ);
  }

  private resetBall(targetPlayer: 1 | 2) {
    this.ball.x = 0;
    this.ball.z = 0;
    this.ball.vx = 0;
    this.ball.vz = 0;
    this.serveTimer = GameConfig.rules.serveDelay;

    // Next serve goes toward the player who lost the point
    this.nextServeDirection = targetPlayer;

    // Prepare the velocity for when the timer hits zero
    const randomZ = Math.random() > 0.5 ? 1 : -1;
    this.ball.vx =
      this.nextServeDirection === 1
        ? -GameConfig.ball.startVelocityX
        : GameConfig.ball.startVelocityX;
    this.ball.vz = GameConfig.ball.startVelocityZ * randomZ;
  }
}
