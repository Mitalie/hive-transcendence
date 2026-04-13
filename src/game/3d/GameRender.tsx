"use client";

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
import { EffectComposer, Bloom } from "@react-three/postprocessing";

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

    const cam = camera as THREE.PerspectiveCamera;
    if (cam.fov !== calculatedFov) {
      cam.fov = calculatedFov;
      cam.updateProjectionMatrix();
    }
  }, [size.width, size.height, camera]);

  return null;
}

export default function GameRender({
  mode,
  onScore,
  paused,
  p1Score,
  p2Score,
}: {
  mode: GameMode;
  onScore: (player: 1 | 2) => void;
  paused: boolean;
  p1Score: number;
  p2Score: number;
}) {
  const dispatch = use(GameStateDispatchContext);

  const [engine, aiOpponent] = useMemo(() => {
    const engine = new PongEngine(onScore, mode.type);
    const aiOpponent =
      mode.opponent === "human" ? null : new AIOpponent(engine, mode.opponent);
    return [engine, aiOpponent];
  }, [onScore, mode]);

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
    <div className="w-full h-full rounded-xl overflow-hidden bg-transparent">
      <Canvas
        shadows
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.setClearColor(0x000000, 0);
        }}
        camera={{
          position: GameConfig.camera.position,
          fov: GameConfig.camera.fov,
        }}
      >
        {/* --- GLOBAL POST-PROCESSING --- */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={1}
            luminanceSmoothing={0.9}
            mipmapBlur
            intensity={0.5}
          />
        </EffectComposer>

        <ResponsiveCamera />
        <GameUpdate
          engine={engine}
          aiOpponent={aiOpponent}
          keys={keys}
          paused={paused}
        />

        <ambientLight intensity={0.5} />

        <directionalLight
          position={[0, 40, 0]}
          intensity={2.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
        >
          <orthographicCamera
            attach="shadow-camera"
            args={[-25, 25, 15, -15, 0.5, 60]}
          />
        </directionalLight>

        <pointLight position={[0, -2, 10]} intensity={2} distance={20} />
        <pointLight position={[0, -2, -10]} intensity={2} distance={20} />

        <Arena p1Score={p1Score} p2Score={p2Score} />
        <Ball ballData={engine.ball} />

        <Paddle
          paddleData={engine.p1}
          initialX={GameConfig.player1.xPos}
          color={GameConfig.colors.p1}
        />
        <Paddle
          paddleData={engine.p2}
          initialX={GameConfig.player2.xPos}
          color={GameConfig.colors.p2}
        />
      </Canvas>
    </div>
  );
}

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
  }, -1);

  return null;
}
