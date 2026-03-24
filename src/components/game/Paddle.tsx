import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PongEngine } from "./PongEngine";
import { GameConfig } from "./GameConfig";

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
  const xPos = player === 1 ? GameConfig.player1.xPos : GameConfig.player2.xPos;

  useFrame(() => {
    meshRef.current.position.z = player === 1 ? engine.p1.z : engine.p2.z;
  });

  return (
    <mesh ref={meshRef} position={[xPos, 0, 0]}>
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
