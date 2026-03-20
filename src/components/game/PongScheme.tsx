"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GameConfig } from "./GameConfig";

export default function PongScheme({
  onScore,
}: {
  onScore: (player: 1 | 2) => void;
}) {
  const ballRef = useRef<THREE.Mesh>(null!);
  const paddle1Ref = useRef<THREE.Mesh>(null!);
  const paddle2Ref = useRef<THREE.Mesh>(null!);

  const ballVelocity = useRef(
    new THREE.Vector3(
      GameConfig.ball.startVelocityX,
      0,
      GameConfig.ball.startVelocityZ,
    ),
  );
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  useFrame(() => {
    if (ballRef.current && paddle1Ref.current && paddle2Ref.current) {
      const speed = GameConfig.paddle.speed;
      const limit = GameConfig.paddle.zLimit;

      // 1. PLAYER 1 MOVEMENT
      if (keys.current["w"]) {
        paddle1Ref.current.position.z -= speed;
      }
      if (keys.current["s"]) {
        paddle1Ref.current.position.z += speed;
      }
      if (paddle1Ref.current.position.z < -limit)
        paddle1Ref.current.position.z = -limit;
      if (paddle1Ref.current.position.z > limit)
        paddle1Ref.current.position.z = limit;

      // 2. PLAYER 2 MOVEMENT
      if (keys.current["ArrowUp"]) {
        paddle2Ref.current.position.z -= speed;
      }
      if (keys.current["ArrowDown"]) {
        paddle2Ref.current.position.z += speed;
      }
      if (paddle2Ref.current.position.z < -limit)
        paddle2Ref.current.position.z = -limit;
      if (paddle2Ref.current.position.z > limit)
        paddle2Ref.current.position.z = limit;

      // 3. BALL MOVEMENT
      ballRef.current.position.x += ballVelocity.current.x;
      ballRef.current.position.z += ballVelocity.current.z;

      const bx = ballRef.current.position.x;
      const bz = ballRef.current.position.z;

      // 4. WALL COLLISIONS
      if (bz >= GameConfig.court.zLimit || bz <= -GameConfig.court.zLimit) {
        ballVelocity.current.z *= -1;
      }

      // 5. RIGHT PADDLE COLLISION (Red)
      const p2z = paddle2Ref.current.position.z;
      const hitBoxDepth = GameConfig.paddle.depth / 2 + GameConfig.ball.radius;

      if (
        bx >= GameConfig.player2.xPos - 0.5 &&
        bx <= GameConfig.player2.xPos &&
        bz >= p2z - hitBoxDepth &&
        bz <= p2z + hitBoxDepth
      ) {
        ballVelocity.current.x *= -1;
        ballRef.current.position.x = GameConfig.player2.xPos - 0.6; // Push out
      }

      // 6. LEFT PADDLE COLLISION (Blue)
      const p1z = paddle1Ref.current.position.z;
      if (
        bx <= GameConfig.player1.xPos + 0.5 &&
        bx >= GameConfig.player1.xPos &&
        bz >= p1z - hitBoxDepth &&
        bz <= p1z + hitBoxDepth
      ) {
        ballVelocity.current.x *= -1;
        ballRef.current.position.x = GameConfig.player1.xPos + 0.6; // Push out
      }

      // 7. SCORING & RESET LOGIC
      if (bx > GameConfig.court.xLimit) {
        onScore(1);
        ballRef.current.position.set(0, 0, 0);
        ballVelocity.current.set(
          GameConfig.ball.startVelocityX,
          0,
          GameConfig.ball.startVelocityZ,
        );
      } else if (bx < -GameConfig.court.xLimit) {
        onScore(2);
        ballRef.current.position.set(0, 0, 0);
        ballVelocity.current.set(
          -GameConfig.ball.startVelocityX,
          0,
          -GameConfig.ball.startVelocityZ,
        );
      }
    }
  });

  // Note: JSX returns are traditionally wrapped in parentheses in React,
  // so the Allman brace doesn't apply perfectly to the return block itself.
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      <mesh position={[0, -0.5, 0]}>
        <boxGeometry
          args={[GameConfig.court.width, 0.1, GameConfig.court.depth]}
        />
        <meshStandardMaterial color="#222222" />
      </mesh>

      <mesh position={[0, 0, -(GameConfig.court.zLimit + 0.25)]}>
        <boxGeometry args={[GameConfig.court.width, 0.5, 0.5]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <mesh position={[0, 0, GameConfig.court.zLimit + 0.25]}>
        <boxGeometry args={[GameConfig.court.width, 0.5, 0.5]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <mesh ref={ballRef} position={[0, 0, 0]}>
        <sphereGeometry args={[GameConfig.ball.radius, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

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
