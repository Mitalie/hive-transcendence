import { useRef, useEffect, useMemo, RefObject, use } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GameConfig } from "@/game/GameConfig";
import {
  GameMode,
  GameStateDispatchContext,
  pauseAction,
} from "@/game/GameState";
import { PongEngine } from "@/game/PongEngine";
import { AIOpponent } from "@/game/AIOpponent";
import Ball from "@/game/3d/Ball";
import Paddle from "@/game/3d/Paddle";
import Arena from "@/game/3d/Arena";

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
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
    applyLensUpdate(perspectiveCamera, calculatedFov);
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
  const dispatch = use(GameStateDispatchContext);

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
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    const handleVisibilityChange = () => {
      if (document.hidden && !paused) dispatch(pauseAction());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch, paused]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <Canvas
        shadows
        camera={{
          position: GameConfig.camera.position,
          fov: GameConfig.camera.fov,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <ResponsiveCamera />
        <GameUpdate
          engine={engine}
          aiOpponent={aiOpponent}
          keys={keys}
          paused={paused}
        />

        <color attach="background" args={["#1a1a2e"]} />
        <ambientLight intensity={0.8} />

        <directionalLight
          position={[0, 30, 0]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
        >
          <orthographicCamera
            attach="shadow-camera"
            args={[-15, 15, 10, -10, 0.1, 50]}
          />
        </directionalLight>

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
  useFrame((_state, delta) => {
    if (paused) return;
    const aiKeys = aiOpponent?.getInputs() ?? {};
    engine.update(delta, {
      ...keys.current,
      ...aiKeys,
    });
  }, -1); // Make sure this runs before components that read the engine state

  return null;
}
