import { useRef, useEffect, useMemo, RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { GameConfig } from "@/game/GameConfig";
import { PongEngine } from "@/game/PongEngine";
import { AIOpponent } from "@/game/AIOpponent";
import Ball from "./Ball";
import Paddle from "./Paddle";
import Arena from "./Arena";
import { GameMode } from "@/game/GameState";

export default function GameRender({
  mode,
  onScore,
  paused,
}: {
  mode: GameMode;
  onScore: (player: 1 | 2) => void;
  paused: boolean;
}) {
  const engine = useMemo(
    () => new PongEngine(onScore, mode.type),
    [onScore, mode.type],
  );

  // Initialize AI and automatically toggle it based on the playMode prop
  const aiOpponent = useMemo(() => {
    if (mode.opponent === "human") return null;
    return new AIOpponent(engine, mode.opponent);
  }, [engine, mode.opponent]);

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

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <Canvas
        camera={{
          position: GameConfig.camera.position,
          fov: GameConfig.camera.fov,
        }}
      >
        <GameUpdate
          engine={engine}
          aiOpponent={aiOpponent}
          keys={keys}
          paused={paused}
        />
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <Arena />
        <Ball ballData={engine.ball} />
        <Paddle
          paddleData={engine.p1}
          initialX={GameConfig.player1.xPos}
          color="blue"
        />
        <Paddle
          paddleData={engine.p2}
          initialX={GameConfig.player2.xPos}
          color="red"
        />
      </Canvas>
    </div>
  );
}

// We'd prefer to not have a separate component for this, but useFrame can only be used in a child of Canvas
function GameUpdate({
  engine,
  aiOpponent,
  keys,
  paused,
}: {
  engine: PongEngine;
  aiOpponent: AIOpponent | null;
  keys: RefObject<Record<string, boolean>>;
  paused: boolean;
}) {
  useFrame((_, delta) => {
    if (paused) return;
    const aiKeys = aiOpponent?.getInputs() ?? {};
    engine.update(delta, {
      ...keys.current,
      ...aiKeys,
    });
  }, -1); // Make sure this runs before components that read the engine state

  return null;
}
