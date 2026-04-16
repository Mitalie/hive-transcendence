import { useRef, useMemo, useEffect, memo } from "react";
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

  const { geometry, material, verticalOffset } = useMemo(() => {
    const h = GameConfig.paddle.height;
    const s = GameConfig.paddleVisuals.skirtExtension;
    const totalHeight = h + s;

    return {
      geometry: new THREE.BoxGeometry(
        GameConfig.paddle.width,
        totalHeight,
        GameConfig.paddle.depth,
      ),
      material: new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: GameConfig.paddleVisuals.emissiveIntensity,
        roughness: GameConfig.paddleVisuals.roughness,
        metalness: GameConfig.paddleVisuals.metalness,
        toneMapped: false,
      }),
      // Offsets the extended skirt so the visible base of the paddle rests flush on the floor plane.
      verticalOffset: -(s / 2),
    };
  }, [color]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

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
  });

  return (
    <group ref={groupRef}>
      <mesh
        castShadow
        receiveShadow
        geometry={geometry}
        material={material}
        position={[0, verticalOffset, 0]}
      />
    </group>
  );
});
