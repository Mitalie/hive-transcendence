"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GameConfig } from "./GameConfig";

// Helper to randomize the initial serve direction
const getRandomServe = () => {
  const dirX = Math.random() > 0.5 ? 1 : -1;
  const dirZ = Math.random() > 0.5 ? 1 : -1;
  return new THREE.Vector3(
    GameConfig.ball.startVelocityX * dirX,
    0,
    GameConfig.ball.startVelocityZ * dirZ,
  );
};

export default function PongScheme({
  onScore,
  gameState,
}: {
  onScore: (player: 1 | 2) => void;
  gameState: "START" | "PLAYING" | "PAUSED" | "WON";
}) {
  // References linking our math directly to the 3D meshes on screen
  const ballRef = useRef<THREE.Mesh>(null!);
  const paddle1Ref = useRef<THREE.Mesh>(null!);
  const paddle2Ref = useRef<THREE.Mesh>(null!);

  // Initialize the very first serve randomly
  const ballVelocity = useRef(getRandomServe());

  // Tracks currently pressed keys for smooth continuous movement
  const keys = useRef<{ [key: string]: boolean }>({});

  // Game-Loop Safe Timers
  // We use refs here so they persist across frames without causing React re-renders.
  const serveTimer = useRef(0);
  const nextServeDirection = useRef<1 | 2>(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // List of keys used in the game that should NOT scroll the browser
      // We check both .key (for W/S) and .code (for Space/Arrows) to be safe
      const gameKeys = ["w", "s", "ArrowUp", "ArrowDown", " ", "Space"];

      if (gameKeys.includes(e.key) || gameKeys.includes(e.code)) {
        e.preventDefault();
      }

      keys.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // --- THE PHYSICS LOOP (Runs 60 FPS) ---
  // We extract 'delta' (time in seconds since the last frame) to power our timer and physics.
  useFrame((state, delta) => {
    // GUARD CLAUSE: Instantly freeze all math if the game isn't actively playing.
    if (gameState !== "PLAYING") return;

    // Prevent physics tunneling if the browser tab is backgrounded or lags.
    // Capping at 0.1 seconds ensures the ball never teleports through the paddle.
    const safeDelta = Math.min(delta, 0.1);

    // --- SERVE DELAY LOGIC ---
    // Because this sits below the PAUSED guard clause, the timer automatically
    // freezes when the player hits the Spacebar!
    if (serveTimer.current > 0) {
      serveTimer.current -= safeDelta * 1000; // Convert delta seconds to milliseconds

      if (serveTimer.current <= 0) {
        // Timer finished! Fire the ball!
        const randomZ = Math.random() > 0.5 ? 1 : -1;
        ballVelocity.current.set(
          nextServeDirection.current === 1
            ? GameConfig.ball.startVelocityX
            : -GameConfig.ball.startVelocityX,
          0,
          GameConfig.ball.startVelocityZ * randomZ,
        );
      }
      return; // Skip all other physics math while the ball is waiting to serve!
    }

    if (ballRef.current && paddle1Ref.current && paddle2Ref.current) {
      const speed = GameConfig.paddle.speed;
      const limit = GameConfig.paddle.zLimit;

      // 1. PLAYER 1 MOVEMENT (W/S) & CLAMPING
      if (keys.current["w"]) paddle1Ref.current.position.z -= speed * safeDelta;
      if (keys.current["s"]) paddle1Ref.current.position.z += speed * safeDelta;
      if (paddle1Ref.current.position.z < -limit)
        paddle1Ref.current.position.z = -limit;
      if (paddle1Ref.current.position.z > limit)
        paddle1Ref.current.position.z = limit;

      // 2. PLAYER 2 MOVEMENT (Arrows) & CLAMPING
      if (keys.current["ArrowUp"])
        paddle2Ref.current.position.z -= speed * safeDelta;
      if (keys.current["ArrowDown"])
        paddle2Ref.current.position.z += speed * safeDelta;
      if (paddle2Ref.current.position.z < -limit)
        paddle2Ref.current.position.z = -limit;
      if (paddle2Ref.current.position.z > limit)
        paddle2Ref.current.position.z = limit;

      // 3. APPLY BALL VELOCITY
      ballRef.current.position.x += ballVelocity.current.x * safeDelta;
      ballRef.current.position.z += ballVelocity.current.z * safeDelta;

      const bx = ballRef.current.position.x;
      const bz = ballRef.current.position.z;

      // 4. WALL COLLISIONS (Top / Bottom)
      // MATH.ABS SAFETY: Prevents the ball from getting stuck inside the wall geometry during lag spikes.
      if (bz >= GameConfig.court.zLimit) {
        ballVelocity.current.z = -Math.abs(ballVelocity.current.z);
      } else if (bz <= -GameConfig.court.zLimit) {
        ballVelocity.current.z = Math.abs(ballVelocity.current.z);
      }

      // 5. RIGHT PADDLE COLLISION (AABB Logic + Push Out to prevent clipping)
      const p2z = paddle2Ref.current.position.z;
      const hitBoxDepth = GameConfig.paddle.depth / 2 + GameConfig.ball.radius;

      if (
        bx >= GameConfig.player2.xPos - 0.5 &&
        bx <= GameConfig.player2.xPos &&
        bz >= p2z - hitBoxDepth &&
        bz <= p2z + hitBoxDepth
      ) {
        // MATH.ABS SAFETY: We force the velocity to be negative (moving left) to prevent
        // a bug where the ball gets stuck inside the paddle geometry vibrating back and forth.
        ballVelocity.current.x = -Math.abs(ballVelocity.current.x);
        ballRef.current.position.x = GameConfig.player2.xPos - 0.6;

        // DYNAMIC BOUNCE ANGLE (Additive Momentum)
        // 1. Find hit point (-1 to 1).
        const hitPoint = (bz - p2z) / (GameConfig.paddle.depth / 2);
        // 2. Preserve incoming angle, but ADD spin/deflection based on where it hit.
        ballVelocity.current.z += hitPoint * GameConfig.ball.deflectionBoost;
        // 3. CLAMP the Z velocity so players can't create an infinitely vertical bouncing ball.
        if (ballVelocity.current.z > GameConfig.ball.maxZVelocity)
          ballVelocity.current.z = GameConfig.ball.maxZVelocity;
        if (ballVelocity.current.z < -GameConfig.ball.maxZVelocity)
          ballVelocity.current.z = -GameConfig.ball.maxZVelocity;
      }

      // 6. LEFT PADDLE COLLISION
      const p1z = paddle1Ref.current.position.z;
      if (
        bx <= GameConfig.player1.xPos + 0.5 &&
        bx >= GameConfig.player1.xPos &&
        bz >= p1z - hitBoxDepth &&
        bz <= p1z + hitBoxDepth
      ) {
        // MATH.ABS SAFETY: Force velocity positive (moving right) to push it out of the paddle.
        ballVelocity.current.x = Math.abs(ballVelocity.current.x);
        ballRef.current.position.x = GameConfig.player1.xPos + 0.6;

        // DYNAMIC BOUNCE ANGLE (Additive Momentum)
        // 1. Find hit point (-1 to 1).
        const hitPoint = (bz - p1z) / (GameConfig.paddle.depth / 2);
        // 2. Preserve incoming angle, but ADD spin/deflection based on where it hit.
        ballVelocity.current.z += hitPoint * GameConfig.ball.deflectionBoost;
        // 3. CLAMP the Z velocity so players can't create an infinitely vertical bouncing ball.
        if (ballVelocity.current.z > GameConfig.ball.maxZVelocity)
          ballVelocity.current.z = GameConfig.ball.maxZVelocity;
        if (ballVelocity.current.z < -GameConfig.ball.maxZVelocity)
          ballVelocity.current.z = -GameConfig.ball.maxZVelocity;
      }

      // 7. GOAL / SCORING LOGIC
      if (bx > GameConfig.court.xLimit) {
        onScore(1); // Tell the React Hook that P1 scored

        // FREEZE BALL IN CENTER
        ballRef.current.position.set(0, 0, 0);
        ballVelocity.current.set(0, 0, 0);

        // SERVE DELAY: Start the internal game loop timer
        serveTimer.current = GameConfig.rules.serveDelay;
        nextServeDirection.current = 1; // 1 means fire Right
      } else if (bx < -GameConfig.court.xLimit) {
        onScore(2); // Tell the React Hook that P2 scored

        // FREEZE BALL IN CENTER
        ballRef.current.position.set(0, 0, 0);
        ballVelocity.current.set(0, 0, 0);

        // SERVE DELAY: Start the internal game loop timer
        serveTimer.current = GameConfig.rules.serveDelay;
        nextServeDirection.current = 2; // 2 means fire Left
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      {/* FLOOR */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry
          args={[GameConfig.court.width, 0.1, GameConfig.court.depth]}
        />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* TOP WALL */}
      <mesh position={[0, 0, -(GameConfig.court.zLimit + 0.25)]}>
        <boxGeometry args={[GameConfig.court.width, 0.5, 0.5]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* BOTTOM WALL */}
      <mesh position={[0, 0, GameConfig.court.zLimit + 0.25]}>
        <boxGeometry args={[GameConfig.court.width, 0.5, 0.5]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* BALL */}
      {/* ANSSI: Replace sphereGeometry and material with your custom ball model */}
      <mesh ref={ballRef} position={[0, 0, 0]}>
        <sphereGeometry args={[GameConfig.ball.radius, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* PLAYER 1 PADDLE (LEFT) */}
      {/* ANSSI: Ensure your 3D model is wrapped in this mesh so the ref moves it! */}
      <mesh ref={paddle1Ref} position={[GameConfig.player1.xPos, 0, 0]}>
        <boxGeometry
          args={[
            GameConfig.paddle.width,
            GameConfig.paddle.height,
            GameConfig.paddle.depth,
          ]}
        />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* PLAYER 2 PADDLE (RIGHT) */}
      {/* ANSSI: Ensure your 3D model is wrapped in this mesh so the ref moves it! */}
      <mesh ref={paddle2Ref} position={[GameConfig.player2.xPos, 0, 0]}>
        <boxGeometry
          args={[
            GameConfig.paddle.width,
            GameConfig.paddle.height,
            GameConfig.paddle.depth,
          ]}
        />
        <meshStandardMaterial color="red" />
      </mesh>
    </>
  );
}
