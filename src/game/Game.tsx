"use client";

import { useCallback, useEffect } from "react";
import GameRender from "@/game/3d/GameRender";
import GameUI from "@/game/ui/GameUI";
import {
  pauseAction,
  resumeAction,
  scoreP1Action,
  scoreP2Action,
  startGameAction,
  useGameState,
} from "@/game/GameState";

export default function Game() {
  const [state, dispatch] = useGameState();

  const onScore = useCallback(
    (player: 1 | 2) => {
      dispatch(player === 1 ? scoreP1Action() : scoreP2Action());
    },
    [dispatch],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.exitPromptOpen) return;
      if (e.code === "Space" && !e.repeat) {
        if (state.view !== "play") dispatch(startGameAction());
        else if (state.paused) dispatch(resumeAction());
        else dispatch(pauseAction());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state.paused, state.view, state.exitPromptOpen]);

  return (
    <div className="relative h-full w-full">
      <GameRender onScore={onScore} mode={state.mode} paused={state.paused} />
      <GameUI state={state} dispatch={dispatch} />
    </div>
  );
}
