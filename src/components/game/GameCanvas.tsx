"use client";

import { Canvas } from "@react-three/fiber";
import PongScheme from "./PongScheme";
import { GameConfig } from "@/game/GameConfig";

interface GameCanvasProps {
  onScore: (player: 1 | 2) => void;
  gameState: "START" | "PLAYING" | "PAUSED" | "WON";
  mode?: "classic" | "advanced";
}

export default function GameCanvas({
  onScore,
  gameState,
  mode,
}: GameCanvasProps) {
  return (
    <div className="bg-card text-text h-[400px] flex justify-center items-center text-[28px] rounded-xl">
      <Canvas
        camera={{
          position: GameConfig.camera.position,
          fov: GameConfig.camera.fov,
        }}
      >
        <color attach="background" args={["#050505"]} />

        {/* The 3D Engine */}
        {/* Pass the mode down into the scheme! */}
        <PongScheme onScore={onScore} gameState={gameState} mode={mode} />
      </Canvas>
    </div>
  );
}
