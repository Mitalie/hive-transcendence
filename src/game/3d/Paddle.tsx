import { useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PaddleData } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export default memo(function Paddle({
  paddleData,
  initialX,
  color,
  scaleMultiplier = 1,
}: {
  paddleData: PaddleData;
  initialX: number;
  color: string;
  scaleMultiplier?: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  const h = GameConfig.paddle.height;
  const s = GameConfig.paddleVisuals.skirtExtension;
  const totalHeight = h + s;
  const verticalOffset = -(s / 2);

  useFrame((_, delta) => {
    if (!groupRef.current || !paddleData) return;

    // Visual scale synchronized with engine hitboxes on all axes
    groupRef.current.scale.set(
      scaleMultiplier,
      scaleMultiplier,
      scaleMultiplier,
    );

    groupRef.current.position.set(
      paddleData.x ?? initialX,
      paddleData.y,
      paddleData.z ?? 0,
    );

    groupRef.current.rotation.x =
      (paddleData.vz ?? 0) * GameConfig.paddleVisuals.tiltFactor * delta;
    groupRef.current.rotation.z =
      -(paddleData.vx ?? 0) * GameConfig.paddleVisuals.tiltFactor * delta;

    // Color preview is read imperatively to reflect settings panel changes in real-time
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
