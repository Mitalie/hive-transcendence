"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GameConfig } from "@/game/GameConfig";
import { useSession } from "next-auth/react";

export const useGameState = (winLimit: number = GameConfig.rules.winLimit) => {
  // Atomic score state for Player 1 (Blue) and Player 2 (Red)
  const { data: session } = useSession();
  const [score, setScore] = useState({ p1: 0, p2: 0 });

  // The global status of the game engine
  const [gameState, setGameState] = useState<
    "START" | "PLAYING" | "PAUSED" | "WON"
  >("START");

  const hasHandledWin = useRef(false);

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

        if (p1Win || p2Win) setGameState("WON");


        return nextScore;
      });
    },
    [winLimit, gameState],
  );

  useEffect(() => {
    const saveMatch = async () => {
      const player1 = session?.user?.email;
      const player2 = "local-player-2";

      if (!player1) {
        console.error("No authenticated user found");
        return;
      }
      
      const payload = {
        player1,
        player2,
        score1: score.p1,
        score2: score.p2,
        winner: score.p1 > score.p2 ? player1 : player2,
      };

      console.log("SAVING MATCH:", payload);

      const res = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save match");
      }

      const data = await res.json();
      console.log("MATCH SAVED:", data);
    };

    if (gameState !== "WON" || hasHandledWin.current) return;

    hasHandledWin.current = true;
    saveMatch().catch((error) => {
      console.error("Failed to save match:", error);
      hasHandledWin.current = false;
    });
  }, [gameState, score, session]);

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
            if (current === "WON") {
              setScore({ p1: 0, p2: 0 });
              hasHandledWin.current = false;
            }
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
