import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PongEngine } from "./PongEngine";
import { GameConfig } from "./GameConfig";

export default function Ball({ engine }: { engine: PongEngine }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    // 3D Position mapping
    meshRef.current.position.x = engine.ball.x;
    meshRef.current.position.y = engine.ball.y; // The gravity bounce!
    meshRef.current.position.z = engine.ball.z;

    // Visual Magnus Spin (Ball physically rolls in the air)
    meshRef.current.rotation.x += engine.ball.spin * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[GameConfig.ball.radius, 16, 16]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}
