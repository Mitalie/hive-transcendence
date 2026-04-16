import { useRef, useMemo, useEffect, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import * as THREE from "three";
import { BallData } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

export default memo(function Ball({ ballData }: { ballData: BallData }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const { geometry, material } = useMemo(() => {
    return {
      geometry: new THREE.SphereGeometry(
        GameConfig.ball.radius,
        GameConfig.ballVisuals.segments,
        GameConfig.ballVisuals.segments,
      ),
      material: new THREE.MeshStandardMaterial({
        color: GameConfig.ballVisuals.color,
        roughness: GameConfig.ballVisuals.roughness,
        metalness: GameConfig.ballVisuals.metalness,
        emissive: GameConfig.ballVisuals.emissive,
        emissiveIntensity: GameConfig.ballVisuals.emissiveIntensity,
      }),
    };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    meshRef.current.position.set(ballData.x, ballData.y, ballData.z);

    meshRef.current.rotation.x +=
      ballData.spin * delta * GameConfig.ballVisuals.visualSpinMultiplier;
    meshRef.current.rotation.z -=
      ballData.vx * delta * GameConfig.ballVisuals.visualSpinMultiplier;
  });

  const ballMesh = (
    <mesh
      ref={meshRef}
      castShadow
      receiveShadow
      geometry={geometry}
      material={material}
    >
      {GameConfig.ballVisuals.showGlow && (
        <pointLight
          color={GameConfig.ballVisuals.emissive}
          intensity={GameConfig.ballVisuals.glowIntensity}
          distance={GameConfig.ballVisuals.glowDistance}
        />
      )}
    </mesh>
  );

  // Trail crashes the Three.js renderer if initialized with length <= 0.
  // We bypass the wrapper entirely if trails are disabled in config.
  if (!GameConfig.ballVisuals.showTrail) {
    return ballMesh;
  }

  return (
    <Trail
      width={GameConfig.ball.radius * 2}
      color={GameConfig.ballVisuals.trailColor}
      length={GameConfig.ballVisuals.trailLength}
      decay={GameConfig.ballVisuals.trailDecay}
      attenuation={(t) => t * t}
    >
      {ballMesh}
    </Trail>
  );
});
