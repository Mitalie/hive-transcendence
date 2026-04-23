import { useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PaddleData } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

const PADDLE_Y = GameConfig.paddle.height / 2;

export default memo(function Paddle({
  paddleData,
  initialX,
  color,
}: {
  paddleData: PaddleData;
  initialX: number;
  color: string;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  const h = GameConfig.paddle.height;
  const s = GameConfig.paddleVisuals.skirtExtension;
  const totalHeight = h + s;

  // Offsets the extended skirt so the visible base of the paddle rests flush on the floor plane.
  const verticalOffset = -(s / 2);

  useFrame((_, delta) => {
    if (!groupRef.current || !paddleData) return;

    groupRef.current.position.set(
      paddleData.x ?? initialX,
      paddleData.y ?? PADDLE_Y,
      paddleData.z ?? 0,
    );

    groupRef.current.rotation.x =
      (paddleData.vz ?? 0) * GameConfig.paddleVisuals.tiltFactor * delta;

    groupRef.current.rotation.z =
      -(paddleData.vx ?? 0) * GameConfig.paddleVisuals.tiltFactor * delta;

    // Real-time color preview: reads GameConfig every frame so changes in the
    // settings panel appear immediately without needing a React re-render.
    if (matRef.current) {
      const liveColor =
        initialX < 0 ? GameConfig.colors.p1 : GameConfig.colors.p2;
      matRef.current.color.set(liveColor);
      matRef.current.emissive.set(liveColor);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow position={[0, verticalOffset, 0]}>
        <boxGeometry
          args={[GameConfig.paddle.width, totalHeight, GameConfig.paddle.depth]}
        />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={GameConfig.paddleVisuals.emissiveIntensity}
          roughness={GameConfig.paddleVisuals.roughness}
          metalness={GameConfig.paddleVisuals.metalness}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
});
