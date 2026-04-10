import { useRef, useEffect, useMemo, RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GameConfig } from "@/game/GameConfig";
import { GameMode } from "@/game/GameState";
import { PongEngine } from "@/game/PongEngine";
import { AIOpponent } from "@/game/AIOpponent";
import Ball from "@/game/3d/Ball";
import Paddle from "@/game/3d/Paddle";
import Arena from "@/game/3d/Arena";

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const aspect = size.width / size.height;
    const targetAspect = 2.2;

    let calculatedFov = GameConfig.camera.fov;

    if (aspect < targetAspect) {
      const zoomFactor = targetAspect / aspect;
      const baseFovRads = THREE.MathUtils.degToRad(GameConfig.camera.fov);
      const newFovRads = 2 * Math.atan(Math.tan(baseFovRads / 2) * zoomFactor);
      calculatedFov = THREE.MathUtils.radToDeg(newFovRads);
    }

    const applyLensUpdate = (cam: THREE.PerspectiveCamera, newFov: number) => {
      cam.fov = newFov;
      cam.updateProjectionMatrix();
    };

    applyLensUpdate(camera, calculatedFov);
  }, [size, camera]);

  return null;
}

export default function GameRender({
  mode,
  onScore,
  paused,
}: {
  mode: GameMode;
  onScore: (player: 1 | 2) => void;
  paused: boolean;
}) {
  const [engine, aiOpponent] = useMemo(() => {
    const engine = new PongEngine(onScore, mode.type);
    const aiOpponent =
      mode.opponent === "human" ? null : new AIOpponent(engine, mode.opponent);
    return [engine, aiOpponent];
  }, [onScore, mode]); // Depend on mode object instead of individual properties to allow resetting the engine by reassigning mode in state

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
        <ResponsiveCamera />
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
