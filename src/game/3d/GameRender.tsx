"use client";

import { useRef, useEffect, useMemo, RefObject, memo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { GameConfig } from "@/game/GameConfig";
import { GameMode } from "@/game/GameState";
import { PongEngine } from "@/game/PongEngine";
import { AIOpponent } from "@/game/AIOpponent";
import Ball from "@/game/3d/Ball";
import Paddle from "@/game/3d/Paddle";
import Arena from "@/game/3d/Arena";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const ResponsiveCamera = memo(function ResponsiveCamera() {
  useFrame((state) => {
    const { camera, size } = state;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const aspect = size.width / size.height;
    const target = GameConfig.render.responsive.targetAspect;
    let calculatedFov = GameConfig.camera.fov;

    // Dynamically calculate FOV adjustments for narrow viewports to keep the arena fully in frame
    if (aspect < target) {
      const zoomFactor = target / aspect;
      const baseFovRads = THREE.MathUtils.degToRad(GameConfig.camera.fov);
      const newFovRads = 2 * Math.atan(Math.tan(baseFovRads / 2) * zoomFactor);
      calculatedFov = THREE.MathUtils.radToDeg(newFovRads);
    }

    if (camera.fov !== calculatedFov) {
      camera.fov = calculatedFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
});

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
  const [flipped, setFlipped] = useState(false);
  const orbitRef = useRef<OrbitControlsImpl>(null);

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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-transparent">
      <Canvas
        // PCFShadowMap set explicitly; PCFSoftShadowMap rejected due to rendering acne on paddle skirts.
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
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

        <OrbitControls
          ref={orbitRef}
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
            if (e?.target) {
              setFlipped(
                Math.abs(e.target.getAzimuthalAngle()) >
                  GameConfig.camera.controls.flipAzimuthThreshold,
              );
            }
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
    // Silently freezes the physics loop if the game is paused or the browser tab is hidden
    if (paused || document.hidden) return;

    const aiKeys = aiOpponent?.getInputs(delta) ?? {};

    engine.update(delta, {
      ...keys.current,
      ...aiKeys,
    });
  }, -1); // Priority -1 ensures this physics update runs before 3D meshes read the state

  return null;
});
