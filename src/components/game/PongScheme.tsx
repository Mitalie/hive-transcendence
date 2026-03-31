"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { GameConfig } from "@/game/GameConfig";
import { PongEngine } from "@/game/PongEngine";
import { AIOpponent } from "@/game/AIOpponent";
import Ball from "./Ball";
import Paddle from "./Paddle";
import Arena from "./Arena";

export default function PongScheme({
  onScore,
  gameState,
  mode,
  playMode = "PvP",
  aiDifficulty = "medium",
}: {
  onScore: (player: 1 | 2) => void;
  gameState: "START" | "PLAYING" | "PAUSED" | "WON";
  mode?: "classic" | "advanced";
  playMode?: "PvP" | "PvE";
  aiDifficulty?: "easy" | "medium" | "hard";
}) {
  const engine = useMemo(() => new PongEngine(onScore, mode), [onScore, mode]);

  // Initialize AI and automatically toggle it based on the playMode prop
  const aiOpponent = useMemo(() => {
    const ai = new AIOpponent(engine);
    ai.setEnabled(playMode === "PvE");
    ai.setDifficulty(aiDifficulty);
    return ai;
  }, [engine, playMode, aiDifficulty]);

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
    // Start with the real human keyboard inputs
    let activeInputs = { ...keys.current };

    // If PvE is active, override Player 2's keys with the AI's logic
    if (playMode === "PvE") {
      const aiKeys = aiOpponent.getInputs();

      // We lowercase them here to match your event listener's formatting
      activeInputs = {
        ...activeInputs,
        arrowup: aiKeys.ArrowUp,
        arrowdown: aiKeys.ArrowDown,
        arrowleft: aiKeys.ArrowLeft,
        arrowright: aiKeys.ArrowRight,
      };
    }

    // Feed the final merged inputs to the engine
    engine.update(delta, activeInputs, gameState);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      {/* STATIC ENVIRONMENT */}
      <Arena />

      {/* DECENTRALIZED ENTITIES */}
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
    </>
  );
}
