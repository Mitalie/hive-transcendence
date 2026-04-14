import { useRef, useMemo, useEffect, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PaddleData } from "@/game/PongEngine";
import { GameConfig } from "@/game/GameConfig";

// Calculate the dynamic vertical center of the paddle once at module level.
const PADDLE_Y = GameConfig.paddle.height / 2;

// Wrapped in React.memo to prevent the component from re-executing during
// parent UI renders unless the paddleData or color actually changes.
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

  // We useMemo to allocate geometries and materials to the GPU exactly once.
  // This prevents the frame-stutter caused by re-allocating buffers during React renders.
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
        // toneMapped: false allows the emissive intensity to break the Bloom threshold (1.0)
        // defined in the parent GameRender. This guarantees the paddle glows.
        toneMapped: false,
      }),
      // The "skirt" extension sits below the floor to hide gaps during tilts.
      // This offset ensures the visible paddle base aligns perfectly with the floor at y=0.
      verticalOffset: -(s / 2),
    };
  }, [color]);

  // Explicitly dispose of GPU assets on unmount to prevent memory leaks
  // when switching game states or scenes.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    // Defensive: engine initializes p1/p2 synchronously, but this guard
    // protects against any future lazy-init changes in PongEngine.
    if (!groupRef.current || !paddleData) return;

    // Using .set() is a direct memory write to the underlying Float32Array,
    // making it significantly faster than assigning properties individually in the loop.
    groupRef.current.position.set(
      paddleData.x ?? initialX,
      paddleData.y ?? PADDLE_Y,
      paddleData.z ?? 0,
    );

    // Scales tilt by elapsed time so the visual feel is consistent per-second.
    // Note: absolute tilt magnitude depends on engine velocities also being
    // delta-normalized in PongEngine.update(). See GameConfig.paddleVisuals.fpsBase.
    const tiltMultiplier = GameConfig.paddleVisuals.fpsBase * delta;

    groupRef.current.rotation.x =
      (paddleData.vz ?? 0) *
      GameConfig.paddleVisuals.tiltFactor *
      tiltMultiplier;

    groupRef.current.rotation.z =
      -(paddleData.vx ?? 0) *
      GameConfig.paddleVisuals.tiltFactor *
      tiltMultiplier;
  });

  return (
    <group ref={groupRef}>
      <mesh
        position={[0, verticalOffset, 0]}
        castShadow
        // receiveShadow is disabled to prevent "shadow acne" moiré patterns
        // where the skirt geometry clips through the floor plane.
        receiveShadow={false}
        geometry={geometry}
        material={material}
      />
    </group>
  );
});
