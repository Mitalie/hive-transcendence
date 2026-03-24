"use client";

import { Canvas } from "@react-three/fiber";

function Ball() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

function Paddle({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.3, 1.5, 0.3]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

export default function PongScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight />
      <directionalLight position={[0, 5, 5]} />
      
      <Ball />
      <Paddle position={[-3, 0, 0]} />
      <Paddle position={[3, 0, 0]} />
    </Canvas>
  );
}