import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PongEngine } from "./PongEngine";
import { GameConfig } from "./GameConfig";

export default function Ball({ engine }: { engine: PongEngine }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    meshRef.current.position.x = engine.ball.x;
    meshRef.current.position.z = engine.ball.z;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[GameConfig.ball.radius, 16, 16]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}
