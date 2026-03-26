"use client";

import { useState, useEffect, useCallback } from "react";
import { GameConfig } from "@/game/GameConfig";

export const useGameState = (winLimit: number = GameConfig.rules.winLimit) => {
  // Atomic score state for Player 1 (Blue) and Player 2 (Red)
  const [score, setScore] = useState({ p1: 0, p2: 0 });

  // The global status of the game engine
  const [gameState, setGameState] = useState<
    "START" | "PLAYING" | "PAUSED" | "WON"
  >("START");

  /**
   * handleScore
   * Triggered by the 3D Engine (PongScheme) when the ball hits a score-line.
   * @param player - Which player scored (1 or 2)
   */
  const handleScore = useCallback(
    (player: 1 | 2) => {
      setScore((prev) => {
        // 1. Calculate the potential new score
        const nextScore =
          player === 1
            ? { ...prev, p1: prev.p1 + 1 }
            : { ...prev, p2: prev.p2 + 1 };

        // 2. PROFESSIONAL WIN CONDITION (Ping Pong Rules):
        // a) Have at least the winLimit points.
        // b) Lead the opponent by 2 or more points (The Deuce Rule).
        const p1Win =
          nextScore.p1 >= winLimit && nextScore.p1 - nextScore.p2 >= 2;
        const p2Win =
          nextScore.p2 >= winLimit && nextScore.p2 - nextScore.p1 >= 2;

        if (p1Win || p2Win) {
          setGameState("WON");
          // ------------------------------------------------------------------
          // DIMI (DATABASE LAYER): Trigger your Prisma save logic here!
          // Payload format: player1, player2, score1, score2, winner
          // ------------------------------------------------------------------
        }

        return nextScore;
      });
    },
    [winLimit],
  );

  /**
   * Keyboard Logic - Game Controller
   * Centralized listener for the Spacebar to manage the flow of the match.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent rapid toggling if the user holds the key down
      if (e.code === "Space" && !e.repeat) {
        setGameState((current) => {
          // START or RESTART: Move into active play from a menu or victory screen.
          if (current === "START" || current === "WON") {
            if (current === "WON") setScore({ p1: 0, p2: 0 }); // Reset score
            return "PLAYING";
          }

          // PAUSE TOGGLE: Freeze or unfreeze the engine loop.
          if (current === "PLAYING") return "PAUSED";
          if (current === "PAUSED") return "PLAYING";

          return current;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { score, gameState, handleScore, setGameState };
};
