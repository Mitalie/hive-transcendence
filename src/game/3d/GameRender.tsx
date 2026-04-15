"use client";

import {
  useRef,
  useEffect,
  useMemo,
  RefObject,
  use,
  memo,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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

/**
 * ResponsiveCamera handles dynamic vertical FOV scaling.
 * We use useFrame instead of useEffect to bypass React Compiler immutability
 * restrictions and to ensure the camera adjusts if the container resizes
 * independently of the window.
 */
const ResponsiveCamera = memo(function ResponsiveCamera() {
  useFrame((state) => {
    const { camera, size } = state;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const aspect = size.width / size.height;
    const target = GameConfig.render.responsive.targetAspect;
    let calculatedFov = GameConfig.camera.fov;

    // If the viewport is narrower than our target aspect, we increase
    // the FOV to keep the full width of the court in frame.
    if (aspect < target) {
      const zoomFactor = target / aspect;
      const baseFovRads = THREE.MathUtils.degToRad(GameConfig.camera.fov);
      const newFovRads = 2 * Math.atan(Math.tan(baseFovRads / 2) * zoomFactor);
      calculatedFov = THREE.MathUtils.radToDeg(newFovRads);
    }

    // Direct mutation inside useFrame is the R3F standard for performance.
    // This allows us to update the lens without triggering React's reconciliation.
    if (camera.fov !== calculatedFov) {
      camera.fov = calculatedFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
});

// GameRender is memoized to isolate the entire 3D pipeline from UI state changes
// that don't affect the 3D environment.
export default memo(function GameRender({
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
  // React 19: use() reads context imperatively — equivalent to
  // useContext(GameStateDispatchContext) but works outside component top-level too.
  const dispatch = use(GameStateDispatchContext);

  // Tracks if the camera has rotated to the opposite side of the court.
  const [flipped, setFlipped] = useState(false);

  // We memoize the engine and AI instances to ensure they persist exactly once
  // across the match lifecycle, even if the renderer re-mounts.
  const [engine, aiOpponent] = useMemo(() => {
    const engine = new PongEngine(onScore, mode.type);
    const aiOpponent =
      mode.opponent === "human" ? null : new AIOpponent(engine, mode.opponent);
    return [engine, aiOpponent];
  }, [onScore, mode]);

  // Clean up engine resources when GameRender unmounts or restarts.
  useEffect(() => {
    return () => {
      engine.dispose?.(); // Reverted to original method names
      aiOpponent?.dispose?.();
    };
  }, [engine, aiOpponent]);

  const keys = useRef<Record<string, boolean>>({});

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Input listeners are strictly scoped to the lifecycle of this match instance.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      // UX GUARD: Don't move paddles if the user is typing in a UI input field.
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      keys.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !pausedRef.current) dispatch(pauseAction());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-transparent">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        camera={{
          position: GameConfig.camera.position,
          fov: GameConfig.camera.fov,
        }}
      >
        <EffectComposer>
          <Bloom
            luminanceThreshold={GameConfig.render.bloom.luminanceThreshold}
            luminanceSmoothing={GameConfig.render.bloom.luminanceSmoothing}
            intensity={GameConfig.render.bloom.intensity}
            mipmapBlur
          />
        </EffectComposer>

        <ResponsiveCamera />

        {/* 360 INTERACTIVE CAMERA CONTROLS */}
        <OrbitControls
          makeDefault
          enablePan={GameConfig.camera.controls.enablePan}
          maxPolarAngle={GameConfig.camera.controls.maxPolarAngle}
          minDistance={GameConfig.camera.controls.minDistance}
          maxDistance={GameConfig.camera.controls.maxDistance}
          mouseButtons={{
            LEFT: GameConfig.camera.controls.mouseButtons.left,
            MIDDLE: GameConfig.camera.controls.mouseButtons.middle,
            RIGHT: GameConfig.camera.controls.mouseButtons.right,
          }}
          onChange={(e) => {
            if (!e) return;
            const azimuth = e.target.getAzimuthalAngle();
            // Swaps scoreboard orientation if the camera crosses the court center-line (90 degrees).
            setFlipped(Math.abs(azimuth) > Math.PI / 2);
          }}
        />

        <GameUpdate
          engine={engine}
          aiOpponent={aiOpponent}
          keys={keys}
          paused={paused}
        />

        <ambientLight intensity={GameConfig.render.lighting.ambientIntensity} />

        <directionalLight
          position={GameConfig.render.lighting.directional.position}
          intensity={GameConfig.render.lighting.directional.intensity}
          castShadow
          shadow-mapSize={[
            GameConfig.render.lighting.directional.shadowMapSize,
            GameConfig.render.lighting.directional.shadowMapSize,
          ]}
          shadow-bias={GameConfig.render.lighting.directional.shadowBias}
          shadow-normalBias={
            GameConfig.render.lighting.directional.shadowNormalBias
          }
        >
          <orthographicCamera
            attach="shadow-camera"
            args={GameConfig.render.lighting.directional.cameraArgs}
          />
        </directionalLight>

        {/* Dynamic Point Light Mapping from Config */}
        {GameConfig.render.lighting.points.map((light, i) => (
          <pointLight
            key={`fill-light-${i}`}
            position={light.position}
            intensity={light.intensity}
            distance={light.distance}
          />
        ))}

        <Arena p1Score={p1Score} p2Score={p2Score} flipped={flipped} />

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
});

// We'd prefer to not have a separate component for this, but useFrame can only be used in a child of Canvas.
const GameUpdate = memo(function GameUpdate({
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

    const aiKeys = aiOpponent?.getInputs(delta) ?? {};

    engine.update(delta, {
      ...keys.current,
      ...aiKeys,
    });
  }, -1);

  return null;
});
