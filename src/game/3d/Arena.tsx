"use client";

import { useMemo, useEffect, memo, Suspense } from "react";
import { Text3D, Center } from "@react-three/drei";
import { GameConfig } from "@/game/GameConfig";
import * as THREE from "three";

const HALF_DEPTH = GameConfig.court.depth / 2;
const HALF_WIDTH = GameConfig.court.width / 2;

const WALL_Z_NEAR = -(
  GameConfig.court.zLimit +
  GameConfig.court.wallThickness / 2
);
const WALL_Z_FAR = GameConfig.court.zLimit + GameConfig.court.wallThickness / 2;

const TEXT_PROPS = {
  font: GameConfig.arena.fontUrl,
  ...GameConfig.arena.textStyle,
} as const;

const ArenaStaticGeometry = memo(function ArenaStaticGeometry({
  geoms,
  mats,
}: {
  geoms: Record<string, THREE.BufferGeometry>;
  mats: Record<string, THREE.Material>;
}) {
  return (
    <group>
      <mesh
        position={[
          0,
          -(GameConfig.court.floorHeight / 2) + GameConfig.arena.offsets.floor,
          0,
        ]}
        receiveShadow
        geometry={geoms.floor}
        material={mats.floor}
      />

      <mesh
        position={[0, GameConfig.arena.offsets.net, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geoms.net}
        material={mats.net}
      />

      {[WALL_Z_NEAR, WALL_Z_FAR].map((z, i) => (
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

          <mesh
            position={[HALF_WIDTH, GameConfig.arena.offsets.vertFrameY, 0]}
            geometry={geoms.vertFrame}
            material={mats.frame}
          />

          <mesh
            position={[-HALF_WIDTH, GameConfig.arena.offsets.vertFrameY, 0]}
            geometry={geoms.vertFrame}
            material={mats.frame}
          />
        </group>
      ))}
    </group>
  );
});

const Scoreboard = memo(function Scoreboard({
  p1Score,
  p2Score,
  flipped,
  mats,
}: {
  p1Score: number;
  p2Score: number;
  flipped: boolean;
  mats: Record<string, THREE.Material>;
}) {
  const displayScoreLeft = flipped ? p2Score : p1Score;
  const displayScoreRight = flipped ? p1Score : p2Score;
  const matLeft = flipped ? mats.p2Text : mats.p1Text;
  const matRight = flipped ? mats.p1Text : mats.p2Text;

  return (
    <Suspense fallback={null}>
      {[1, -1].map((side) => (
        <group
          key={`scoreboard-${side}`}
          position={[
            0,
            -(GameConfig.court.floorHeight / 2) +
              GameConfig.court.scoreboardHeightOffset,
            (HALF_DEPTH + GameConfig.arena.offsets.scoreboardDepth) * side,
          ]}
          rotation={[0, side === -1 ? Math.PI : 0, 0]}
        >
          <group position={[-HALF_WIDTH / 2, 0, 0]}>
            <Center>
              <Text3D {...TEXT_PROPS} material={matLeft}>
                {String(displayScoreLeft).padStart(2, "0")}
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
              <Text3D {...TEXT_PROPS} material={matRight}>
                {String(displayScoreRight).padStart(2, "0")}
              </Text3D>
            </Center>
          </group>
        </group>
      ))}
    </Suspense>
  );
});

export default memo(function Arena({
  p1Score,
  p2Score,
  flipped,
}: {
  p1Score: number;
  p2Score: number;
  flipped: boolean;
}) {
  const geoms = useMemo(
    () => ({
      floor: new THREE.BoxGeometry(
        GameConfig.court.width,
        GameConfig.court.floorHeight,
        GameConfig.court.depth,
      ),
      net: new THREE.PlaneGeometry(
        GameConfig.court.netWidth,
        GameConfig.court.depth,
      ),
      wall: new THREE.BoxGeometry(
        GameConfig.court.width,
        GameConfig.court.wallHeight,
        GameConfig.court.wallThickness,
      ),
      topFrame: new THREE.BoxGeometry(
        GameConfig.court.width,
        GameConfig.court.frameThickness,
        GameConfig.court.wallThickness +
          GameConfig.arena.offsets.frameGeometryOversize,
      ),
      vertFrame: new THREE.BoxGeometry(
        GameConfig.court.frameThickness,
        GameConfig.court.wallHeight,
        GameConfig.court.wallThickness +
          GameConfig.arena.offsets.frameGeometryOversize,
      ),
    }),
    [],
  );

  const mats = useMemo(
    () => ({
      floor: new THREE.MeshToonMaterial({ color: GameConfig.arena.floorColor }),
      net: new THREE.MeshBasicMaterial({
        color: GameConfig.arena.netColor,
        transparent: true,
        opacity: GameConfig.arena.netOpacity,
      }),
      p1Text: new THREE.MeshStandardMaterial({
        color: GameConfig.colors.p1,
        emissive: GameConfig.colors.p1,
        emissiveIntensity: GameConfig.arena.scoreboardEmissive,
        toneMapped: false,
      }),
      p2Text: new THREE.MeshStandardMaterial({
        color: GameConfig.colors.p2,
        emissive: GameConfig.colors.p2,
        emissiveIntensity: GameConfig.arena.scoreboardEmissive,
        toneMapped: false,
      }),
      vsText: new THREE.MeshBasicMaterial({
        color: GameConfig.arena.vsTextColor,
        toneMapped: false,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: GameConfig.arena.glassColor,
        transparent: true,
        opacity: GameConfig.arena.glassOpacity,
        depthWrite: false,
      }),
      frame: new THREE.MeshStandardMaterial({
        color: GameConfig.arena.frameColor,
        emissive: GameConfig.arena.frameColor,
        emissiveIntensity: GameConfig.arena.frameEmissiveIntensity,
        transparent: true,
        opacity: GameConfig.arena.frameOpacity,
        metalness: GameConfig.arena.frameMetalness,
        roughness: GameConfig.arena.frameRoughness,
        depthWrite: false,
      }),
    }),
    [],
  );

  useEffect(() => {
    return () => {
      Object.values(geoms).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [geoms, mats]);

  return (
    <group>
      <ArenaStaticGeometry geoms={geoms} mats={mats} />
      <Scoreboard
        p1Score={p1Score}
        p2Score={p2Score}
        flipped={flipped}
        mats={mats}
      />
    </group>
  );
});
