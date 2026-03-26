import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BallData } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export default function Ball({ ballData }: { ballData: BallData }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    // 3D Position mapping
    meshRef.current.position.x = ballData.x;
    meshRef.current.position.y = ballData.y; // The gravity bounce!
    meshRef.current.position.z = ballData.z;

    // Visual Magnus Spin (Ball physically rolls in the air)
    meshRef.current.rotation.x += ballData.spin * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[GameConfig.ball.radius, 16, 16]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}
