import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PongEngine } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export default function Paddle({
  engine,
  player,
  color,
}: {
  engine: PongEngine;
  player: 1 | 2;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Keep the initial position calculation to prevent 1-frame flickering
  const initialX =
    player === 1 ? GameConfig.player1.xPos : GameConfig.player2.xPos;

  useFrame(() => {
    const pData = player === 1 ? engine.p1 : engine.p2;

    // Map 3D Position
    meshRef.current.position.x = pData.x;
    meshRef.current.position.z = pData.z;

    // Visual Juice: Lean into the direction of movement (Pitch & Roll)
    meshRef.current.rotation.x = pData.vz * -0.02; // Leans side to side
    meshRef.current.rotation.z = pData.vx * -0.02; // Leans forward/backward!
  });

  return (
    // Pass the initial position so it spawns in the right place
    <mesh ref={meshRef} position={[initialX, 0, 0]}>
      <boxGeometry
        args={[
          GameConfig.paddle.width,
          GameConfig.paddle.height,
          GameConfig.paddle.depth,
        ]}
      />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
