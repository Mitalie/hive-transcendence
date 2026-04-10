import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PaddleData } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export default function Paddle({
  paddleData,
  initialX,
  color,
}: {
  paddleData: PaddleData;
  initialX: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    // Map 3D Position
    meshRef.current.position.x = paddleData.x;
    meshRef.current.position.z = paddleData.z;

    // Visual Juice: Lean into the direction of movement (Pitch & Roll)
    meshRef.current.rotation.x = paddleData.vz * -0.02; // Leans side to side
    meshRef.current.rotation.z = paddleData.vx * -0.02; // Leans forward/backward!
  });

  return (
    <mesh ref={meshRef} position={[initialX, 0, 0]} castShadow receiveShadow>
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
