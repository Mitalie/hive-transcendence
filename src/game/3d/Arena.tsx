"use client";

import { memo, useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";
import { GameConfig } from "@/game/GameConfig";

// Base text configurations utilized by both the player scores and the "VS" text block
const TEXT_PROPS = {
  font: GameConfig.arena.fontUrl,
  ...GameConfig.arena.textStyle,
} as const;

// SideWall abstracts the complex bounding box and top/side framing geometry to keep the parent clean
const SideWall = memo(function SideWall({ z }: { z: number }) {
  const HALF_WIDTH = GameConfig.court.width / 2;

  const glassMatRef = useRef<THREE.MeshStandardMaterial>(null!);
  const topFrameMatRef = useRef<THREE.MeshStandardMaterial>(null!);
  const leftFrameMatRef = useRef<THREE.MeshStandardMaterial>(null!);
  const rightFrameMatRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(() => {
    const g = GameConfig.arena.glassColor;
    const f = GameConfig.arena.frameColor;
    if (glassMatRef.current) glassMatRef.current.color.set(g);
    for (const ref of [topFrameMatRef, leftFrameMatRef, rightFrameMatRef]) {
      if (ref.current) {
        ref.current.color.set(f);
        ref.current.emissive.set(f);
      }
    }
  });

  return (
    <group position={[0, GameConfig.court.wallHeight / 2, z]}>
      <mesh>
        <boxGeometry
          args={[
            GameConfig.court.width,
            GameConfig.court.wallHeight,
            GameConfig.court.wallThickness,
          ]}
        />
        <meshStandardMaterial
          ref={glassMatRef}
          color={GameConfig.arena.glassColor}
          transparent
          opacity={GameConfig.arena.glassOpacity}
          depthWrite={false}
        />
      </mesh>

      {/* We keep these materials inline to embrace R3F's declarative nature, as requested by the primary review */}
      <mesh position={[0, GameConfig.court.wallHeight / 2, 0]}>
        <boxGeometry
          args={[
            GameConfig.court.width,
            GameConfig.court.frameThickness,
            GameConfig.court.wallThickness +
              GameConfig.arena.offsets.frameGeometryOversize,
          ]}
        />
        <meshStandardMaterial
          ref={topFrameMatRef}
          color={GameConfig.arena.frameColor}
          emissive={GameConfig.arena.frameColor}
          emissiveIntensity={GameConfig.arena.frameEmissiveIntensity}
          transparent
          opacity={GameConfig.arena.frameOpacity}
          metalness={GameConfig.arena.frameMetalness}
          roughness={GameConfig.arena.frameRoughness}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[HALF_WIDTH, GameConfig.arena.offsets.vertFrameY, 0]}>
        <boxGeometry
          args={[
            GameConfig.court.frameThickness,
            GameConfig.court.wallHeight,
            GameConfig.court.wallThickness +
              GameConfig.arena.offsets.frameGeometryOversize,
          ]}
        />
        <meshStandardMaterial
          ref={rightFrameMatRef}
          color={GameConfig.arena.frameColor}
          emissive={GameConfig.arena.frameColor}
          emissiveIntensity={GameConfig.arena.frameEmissiveIntensity}
          transparent
          opacity={GameConfig.arena.frameOpacity}
          metalness={GameConfig.arena.frameMetalness}
          roughness={GameConfig.arena.frameRoughness}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[-HALF_WIDTH, GameConfig.arena.offsets.vertFrameY, 0]}>
        <boxGeometry
          args={[
            GameConfig.court.frameThickness,
            GameConfig.court.wallHeight,
            GameConfig.court.wallThickness +
              GameConfig.arena.offsets.frameGeometryOversize,
          ]}
        />
        <meshStandardMaterial
          ref={leftFrameMatRef}
          color={GameConfig.arena.frameColor}
          emissive={GameConfig.arena.frameColor}
          emissiveIntensity={GameConfig.arena.frameEmissiveIntensity}
          transparent
          opacity={GameConfig.arena.frameOpacity}
          metalness={GameConfig.arena.frameMetalness}
          roughness={GameConfig.arena.frameRoughness}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
});

// Groups all non-interactive map geometries
// Floor and net use materialRef + useFrame to pick up GameConfig changes in real time,
// even while the physics loop is paused.
const ArenaStaticGeometry = memo(function ArenaStaticGeometry() {
  const floorMatRef = useRef<THREE.MeshToonMaterial>(null!);
  const netMatRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(() => {
    if (floorMatRef.current)
      floorMatRef.current.color.set(GameConfig.arena.floorColor);
    if (netMatRef.current)
      netMatRef.current.color.set(GameConfig.arena.netColor);
  });

  // Constants kept local to the component body per review instructions
  const WALL_Z_NEAR = -(
    GameConfig.court.zLimit +
    GameConfig.court.wallThickness / 2
  );
  const WALL_Z_FAR =
    GameConfig.court.zLimit + GameConfig.court.wallThickness / 2;

  return (
    <group>
      <mesh
        position={[
          0,
          -(GameConfig.court.floorHeight / 2) + GameConfig.arena.offsets.floor,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            GameConfig.court.width,
            GameConfig.court.floorHeight,
            GameConfig.court.depth,
          ]}
        />
        <meshToonMaterial
          ref={floorMatRef}
          color={GameConfig.arena.floorColor}
        />
      </mesh>

      <mesh
        position={[0, GameConfig.arena.offsets.net, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry
          args={[GameConfig.court.netWidth, GameConfig.court.depth]}
        />
        <meshBasicMaterial
          ref={netMatRef}
          color={GameConfig.arena.netColor}
          transparent
          opacity={GameConfig.arena.netOpacity}
        />
      </mesh>

      <SideWall z={WALL_Z_NEAR} />
      <SideWall z={WALL_Z_FAR} />
    </group>
  );
});

// ScoreText wraps a single Text3D and updates its material color imperatively every frame.
// Text3D renders as a THREE.Mesh whose material is set by its <meshStandardMaterial> child.
// We grab the mesh ref and call material.color.set() + material.emissive.set() each frame
// so color preview is instant without needing a React re-render.
const ScoreText = memo(function ScoreText({
  text,
  getColor,
}: {
  text: string;
  getColor: () => string;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;
    if (!mat) return;
    const color = getColor();
    // Text3D may produce a single material or an array; handle both
    if (Array.isArray(mat)) {
      for (const m of mat) {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.color.set(color);
          m.emissive.set(color);
        }
      }
    } else if (mat instanceof THREE.MeshStandardMaterial) {
      mat.color.set(color);
      mat.emissive.set(color);
    }
  });

  return (
    <Center>
      <Text3D ref={meshRef} {...TEXT_PROPS}>
        {text}
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={GameConfig.arena.scoreboardEmissive}
          toneMapped={false}
        />
      </Text3D>
    </Center>
  );
});

const ScoreboardSide = memo(function ScoreboardSide({
  p1Score,
  p2Score,
  side,
}: {
  p1Score: number;
  p2Score: number;
  side: 1 | -1;
}) {
  // Derive the visual layout directly from the physical face
  const isBackFace = side === -1;

  const displayScoreLeft = isBackFace ? p2Score : p1Score;
  const displayScoreRight = isBackFace ? p1Score : p2Score;

  // getColor reads GameConfig live — used both as initial value and in useFrame
  const getColorLeft = isBackFace
    ? () => GameConfig.colors.p2
    : () => GameConfig.colors.p1;
  const getColorRight = isBackFace
    ? () => GameConfig.colors.p1
    : () => GameConfig.colors.p2;

  const HALF_DEPTH = GameConfig.court.depth / 2;
  const HALF_WIDTH = GameConfig.court.width / 2;

  return (
    <group
      position={[
        0,
        -(GameConfig.court.floorHeight / 2) +
          GameConfig.court.scoreboardHeightOffset,
        (HALF_DEPTH + GameConfig.arena.offsets.scoreboardDepth) * side,
      ]}
      rotation={[0, side === -1 ? Math.PI : 0, 0]}
    >
      <group position={[-HALF_WIDTH / 2, 0, 0]}>
        <ScoreText
          text={String(displayScoreLeft).padStart(2, "0")}
          getColor={getColorLeft}
        />
      </group>
      <group position={[0, 0, 0]}>
        <Center>
          <Text3D {...TEXT_PROPS}>
            VS
            <meshBasicMaterial
              color={GameConfig.arena.vsTextColor}
              toneMapped={false}
            />
          </Text3D>
        </Center>
      </group>
      <group position={[HALF_WIDTH / 2, 0, 0]}>
        <ScoreText
          text={String(displayScoreRight).padStart(2, "0")}
          getColor={getColorRight}
        />
      </group>
    </group>
  );
});

// Combines both visible sides of the scoreboard into a single component
const Scoreboard = memo(function Scoreboard({
  p1Score,
  p2Score,
}: {
  p1Score: number;
  p2Score: number;
}) {
  return (
    <group>
      <Suspense fallback={null}>
        <ScoreboardSide p1Score={p1Score} p2Score={p2Score} side={1} />
      </Suspense>
      <Suspense fallback={null}>
        <ScoreboardSide p1Score={p1Score} p2Score={p2Score} side={-1} />
      </Suspense>
    </group>
  );
});

export default memo(function Arena({
  p1Score,
  p2Score,
}: {
  p1Score: number;
  p2Score: number;
}) {
  return (
    <group>
      <ArenaStaticGeometry />
      <Scoreboard p1Score={p1Score} p2Score={p2Score} />
    </group>
  );
});
