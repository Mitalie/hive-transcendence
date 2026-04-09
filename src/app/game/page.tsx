// game page

"use client";

import GameCanvas from "@/components/game/GameCanvas";
import GameUI from "@/components/game/GameUI";

// HOOKS/CONFIG
import {
  mainMenuAction,
  pauseAction,
  resumeAction,
  scoreP1Action,
  scoreP2Action,
  startGameAction,
  useGameState,
} from "@/game/GameState";
import { useCallback, useEffect, useMemo } from "react";

export default function GamePage() {
  const [state, dispatch] = useGameState();

  const onScore = useCallback(
    (player: 1 | 2) => {
      dispatch(player === 1 ? scoreP1Action() : scoreP2Action());
    },
    [dispatch],
  );

  // Compatibility layer between useGameState and existing components
  // FIXME - refactor GameCanvas and GameUI to align with state structure

  const score = useMemo(
    () => ({ p1: state.score1, p2: state.score2 }),
    [state.score1, state.score2],
  );

  const gameState = useMemo(() => {
    switch (state.view) {
      case "start":
        return "START";
      case "play":
        return state.paused ? "PAUSED" : "PLAYING";
      case "end":
        return "WON";
    }
  }, [state.view, state.paused]);

  const setGameState = useCallback(
    (newState: "START" | "PLAYING" | "PAUSED" | "WON") => {
      console.log("Setting game state to", newState);
      switch (newState) {
        case "START":
          return dispatch(mainMenuAction());
        case "PLAYING":
          return dispatch(startGameAction());
        case "PAUSED":
          return dispatch(pauseAction());
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        if (state.view !== "play") dispatch(startGameAction());
        else if (state.paused) dispatch(resumeAction());
        else dispatch(pauseAction());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state.paused, state.view]);

  return (
    <div className="relative h-full w-full">
      <GameCanvas
        onScore={onScore}
        gameState={gameState}
        mode={state.mode.type}
      />
      <GameUI score={score} gameState={gameState} setGameState={setGameState} />
    </div>
  );
}
