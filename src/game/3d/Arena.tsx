import { useMemo } from "react";
import { Text3D, Center } from "@react-three/drei";
import { GameConfig } from "@/game/GameConfig";
import * as THREE from "three";

// Extracted outside the component to prevent constant garbage collection and memory reallocation during React renders.
const HALF_DEPTH = GameConfig.court.depth / 2;
const HALF_WIDTH = GameConfig.court.width / 2;

const TEXT_PROPS = {
  font: GameConfig.arena.fontUrl,
  size: 2.2,
  height: 0.1,
  curveSegments: 12,
  bevelEnabled: true,
  bevelThickness: 0.01,
  bevelSize: 0.01,
};

export default function Arena({
  p1Score,
  p2Score,
}: {
  p1Score: number;
  p2Score: number;
}) {
  // In React Three Fiber, declaring inline tags like <boxGeometry> forces the engine to
  // destroy and recreate the 3D buffer on every single score update (causing frame stutter).
  // We useMemo to allocate them onto the GPU exactly once.
  const geoms = useMemo(
    () => ({
      floor: new THREE.BoxGeometry(
        GameConfig.court.width,
        GameConfig.court.floorHeight,
        GameConfig.court.depth,
      ),
      bezel: new THREE.BoxGeometry(
        GameConfig.court.width - 0.1,
        0.01,
        GameConfig.court.depth - 0.1,
      ),
      net: new THREE.PlaneGeometry(0.15, GameConfig.court.depth),
      wall: new THREE.BoxGeometry(
        GameConfig.court.width,
        GameConfig.court.wallHeight,
        0.5,
      ),
      topFrame: new THREE.BoxGeometry(GameConfig.court.width, 0.02, 0.51),
      vertFrame: new THREE.BoxGeometry(0.02, GameConfig.court.wallHeight, 0.51),
    }),
    [],
  );

  const mats = useMemo(
    () => ({
      floor: new THREE.MeshToonMaterial({ color: GameConfig.arena.floorColor }),
      bezel: new THREE.MeshStandardMaterial({
        color: GameConfig.arena.bezelColor,
        roughness: 0.1,
        metalness: 0.9,
      }),
      net: new THREE.MeshBasicMaterial({
        color: GameConfig.arena.netColor,
        transparent: true,
        opacity: GameConfig.arena.netOpacity,
      }),

      // emissiveIntensity is set to 2.5 to intentionally break the Bloom luminanceThreshold (1.0)
      // defined in the parent GameRender. This guarantees only the scores glow.
      p1Text: new THREE.MeshStandardMaterial({
        color: GameConfig.colors.p1,
        emissive: GameConfig.colors.p1,
        emissiveIntensity: 2.5,
        toneMapped: false,
      }),
      p2Text: new THREE.MeshStandardMaterial({
        color: GameConfig.colors.p2,
        emissive: GameConfig.colors.p2,
        emissiveIntensity: 2.5,
        toneMapped: false,
      }),

      // MeshBasicMaterial is used here instead of Standard to make the "VS" completely immune
      // to scene point-lights. This prevents uneven bottom-glare/hotspots.
      vsText: new THREE.MeshBasicMaterial({
        color: "#ffffff",
        toneMapped: false,
      }),

      glass: new THREE.MeshStandardMaterial({
        color: GameConfig.arena.glassColor,
        transparent: true,
        opacity: GameConfig.arena.glassOpacity,
        depthWrite: false, // Prevents Z-fighting and transparency sorting bugs against the net
      }),
      frame: new THREE.MeshStandardMaterial({
        color: GameConfig.arena.frameColor,
        emissive: GameConfig.arena.frameColor,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: GameConfig.arena.frameOpacity,
        metalness: 0.8,
        roughness: 0.2,
        depthWrite: false,
      }),
    }),
    [],
  );

  return (
    <group>
      <mesh
        position={[0, -(GameConfig.court.floorHeight / 2), 0]}
        receiveShadow
        geometry={geoms.floor}
        material={mats.floor}
      />

      <mesh
        position={[0, -0.005, 0]}
        castShadow={false}
        geometry={geoms.bezel}
        material={mats.bezel}
      />

      {[1, -1].map((side) => (
        <group
          key={`scoreboard-${side}`}
          position={[
            0,
            -(GameConfig.court.floorHeight / 2) + 0.3,
            (HALF_DEPTH + 0.01) * side,
          ]}
          rotation={[0, side === -1 ? Math.PI : 0, 0]}
        >
          <group position={[-HALF_WIDTH / 2, 0, 0]}>
            <Center>
              <Text3D {...TEXT_PROPS} material={mats.p1Text}>
                {String(p1Score).padStart(2, "0")}
              </Text3D>
            </Center>
          </group>

          <group position={[0, 0, 0]}>
            <Center>
              <Text3D {...TEXT_PROPS} material={mats.vsText}>
                VS
              </Text3D>
            </Center>
          </group>

          <group position={[HALF_WIDTH / 2, 0, 0]}>
            <Center>
              <Text3D {...TEXT_PROPS} material={mats.p2Text}>
                {String(p2Score).padStart(2, "0")}
              </Text3D>
            </Center>
          </group>
        </group>
      ))}

      <mesh
        position={[0, 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geoms.net}
        material={mats.net}
      />

      {/* The wall geometry is 0.5 thick. We offset its center position by exactly half that (0.25)
          so the inner face sits perfectly flush against the zLimit boundary without clipping. */}
      {[-(GameConfig.court.zLimit + 0.25), GameConfig.court.zLimit + 0.25].map(
        (z, i) => (
          <group
            key={`side-wall-${i}`}
            position={[0, GameConfig.court.wallHeight / 2, z]}
          >
            <mesh geometry={geoms.wall} material={mats.glass} />

            <mesh
              position={[0, GameConfig.court.wallHeight / 2, 0]}
              geometry={geoms.topFrame}
              material={mats.frame}
            />

            {[GameConfig.court.width / 2, -GameConfig.court.width / 2].map(
              (x, k) => (
                <mesh
                  key={`v-${k}`}
                  position={[x, -0.01, 0]}
                  geometry={geoms.vertFrame}
                  material={mats.frame}
                />
              ),
            )}
          </group>
        ),
      )}
    </group>
  );
}
