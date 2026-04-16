"use client";

import { memo, Suspense } from "react";
import { Text3D, Center } from "@react-three/drei";
import { GameConfig } from "@/game/GameConfig";

// Base text configurations utilized by both the player scores and the "VS" text block
const TEXT_PROPS = {
  font: GameConfig.arena.fontUrl,
  ...GameConfig.arena.textStyle,
} as const;

// SideWall abstracts the complex bounding box and top/side framing geometry to keep the parent clean
const SideWall = memo(function SideWall({ z }: { z: number }) {
  // Kept inside the component to satisfy the architectural request regarding static vs dynamic memory
  const HALF_WIDTH = GameConfig.court.width / 2;

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
const ArenaStaticGeometry = memo(function ArenaStaticGeometry() {
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
        <meshToonMaterial color={GameConfig.arena.floorColor} />
      </mesh>

      <mesh
        position={[0, GameConfig.arena.offsets.net, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry
          args={[GameConfig.court.netWidth, GameConfig.court.depth]}
        />
        <meshBasicMaterial
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

// A single side of the 3D scoreboard block.
// Uses the 'flipped' prop to ensure colors and scores stay aligned with the player's perspective.
const ScoreboardSide = memo(function ScoreboardSide({
  p1Score,
  p2Score,
  flipped,
  side,
}: {
  p1Score: number;
  p2Score: number;
  flipped: boolean;
  side: 1 | -1;
}) {
  const displayScoreLeft = flipped ? p2Score : p1Score;
  const displayScoreRight = flipped ? p1Score : p2Score;

  const colorLeft = flipped ? GameConfig.colors.p2 : GameConfig.colors.p1;
  const colorRight = flipped ? GameConfig.colors.p1 : GameConfig.colors.p2;

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
        <Center>
          <Text3D {...TEXT_PROPS}>
            {String(displayScoreLeft).padStart(2, "0")}
            <meshStandardMaterial
              color={colorLeft}
              emissive={colorLeft}
              emissiveIntensity={GameConfig.arena.scoreboardEmissive}
              toneMapped={false}
            />
          </Text3D>
        </Center>
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
        <Center>
          <Text3D {...TEXT_PROPS}>
            {String(displayScoreRight).padStart(2, "0")}
            <meshStandardMaterial
              color={colorRight}
              emissive={colorRight}
              emissiveIntensity={GameConfig.arena.scoreboardEmissive}
              toneMapped={false}
            />
          </Text3D>
        </Center>
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
      {/* Wrapping each side in its own Suspense prevents visual "pop-in" asymmetry during font loading */}
      <Suspense fallback={null}>
        <ScoreboardSide
          p1Score={p1Score}
          p2Score={p2Score}
          flipped={false}
          side={1}
        />
      </Suspense>
      <Suspense fallback={null}>
        <ScoreboardSide
          p1Score={p1Score}
          p2Score={p2Score}
          flipped={true}
          side={-1}
        />
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
