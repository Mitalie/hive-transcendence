import { useRef, useMemo, useEffect, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import * as THREE from "three";
import { BallData } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

// memo prevents re-renders from parent UI state changes.
// ballData is a mutable reference from PongEngine — its properties
// are mutated in place each frame and read directly in useFrame,
// so React's shallow prop comparison correctly treats it as stable.
export default memo(function Ball({ ballData }: { ballData: BallData }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // In React Three Fiber, inline geometries force the Garbage Collector to rebuild
  // the buffer on every render. We useMemo to lock it in GPU memory once.
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

  // Cleanup effect to release GPU resources when the ball is removed from the scene.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Using .set() is mathematically faster in the Three.js update loop
    // than assigning x, y, and z properties individually.
    meshRef.current.position.set(ballData.x, ballData.y, ballData.z);

    // Multiplying by 'delta' (time since last frame) is critical here.
    // It ensures the visual spin speed is identical across all monitor refresh rates (60Hz vs 144Hz).
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
      {/* Placed directly inside the mesh so the rendering engine automatically
          syncs the light's position to the ball with zero extra matrix math. */}
      {GameConfig.ballVisuals.showGlow && (
        <pointLight
          color={GameConfig.ballVisuals.emissive}
          intensity={GameConfig.ballVisuals.glowIntensity}
          distance={GameConfig.ballVisuals.glowDistance}
        />
      )}
    </mesh>
  );

  // We must return early if the trail is disabled.
  // Passing length={0} directly into the <Trail> component can crash the Three.js renderer.
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
