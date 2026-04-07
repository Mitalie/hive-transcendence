"use client";

import { Canvas } from "@react-three/fiber";
import PongScheme from "./PongScheme";
import { GameConfig } from "@/game/GameConfig";

interface GameCanvasProps {
  onScore: (player: 1 | 2) => void;
  gameState: "START" | "PLAYING" | "PAUSED" | "WON";
  mode?: "classic" | "advanced";
  playMode?: "PvP" | "PvE";
  aiDifficulty?: "easy" | "medium" | "hard";
}

export default function GameCanvas({
  onScore,
  gameState,
  mode,
  playMode,
  aiDifficulty,
}: GameCanvasProps) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <Canvas
        camera={{
          position: GameConfig.camera.position,
          fov: GameConfig.camera.fov,
        }}
      >
        <color attach="background" args={["#050505"]} />
        <PongScheme
          onScore={onScore}
          gameState={gameState}
          mode={mode}
          playMode={playMode}
          aiDifficulty={aiDifficulty}
        />
      </Canvas>
    </div>
  );
}
