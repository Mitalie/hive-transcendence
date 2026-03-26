"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { GameConfig } from "@/game/GameConfig";
import { PongEngine } from "@/game/PongEngine";
import Ball from "./Ball";
import Paddle from "./Paddle";

export default function PongScheme({
  onScore,
  gameState,
  mode,
}: {
  onScore: (player: 1 | 2) => void;
  gameState: "START" | "PLAYING" | "PAUSED" | "WON";
  mode?: "classic" | "advanced";
}) {
  const engine = useMemo(() => new PongEngine(onScore, mode), [onScore, mode]);
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const gameKeys = [
        "w",
        "s",
        "a",
        "d",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        " ",
        "Space",
      ];

      if (gameKeys.includes(e.key) || gameKeys.includes(e.code)) {
        e.preventDefault();
      }

      keys.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    engine.update(delta, keys.current, gameState);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      {/* FLOOR */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry
          args={[GameConfig.court.width, 0.1, GameConfig.court.depth]}
        />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* TOP WALL */}
      <mesh
        position={[
          0,
          GameConfig.court.wallHeight / 2,
          -(GameConfig.court.zLimit + 0.25),
        ]}
      >
        <boxGeometry
          args={[GameConfig.court.width, GameConfig.court.wallHeight, 0.5]}
        />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* BOTTOM WALL */}
      <mesh
        position={[
          0,
          GameConfig.court.wallHeight / 2,
          GameConfig.court.zLimit + 0.25,
        ]}
      >
        <boxGeometry
          args={[GameConfig.court.width, GameConfig.court.wallHeight, 0.5]}
        />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* DECENTRALIZED ENTITIES */}
      <Ball engine={engine} />
      <Paddle engine={engine} player={1} color="blue" />
      <Paddle engine={engine} player={2} color="red" />
    </>
  );
}
