"use client";

import { useCallback, useEffect } from "react";
import {
  exitConfirmAction,
  GameStateDispatchContext,
  pauseAction,
  resumeAction,
  scoreP1Action,
  scoreP2Action,
  startGameAction,
  useGameState,
} from "@/game/GameState";
import Button from "@/components/Button";
import ScoreBoard from "@/game/ui/ScoreBoard";
import GameUI from "@/game/ui/GameUI";
import GameRender from "@/game/3d/GameRender";

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

  const onStartClick = useCallback(() => {
    dispatch(startGameAction());
  }, [dispatch]);

  const onExitClick = useCallback(() => {
    dispatch(exitConfirmAction());
  }, [dispatch]);

  if (state.view === "start") {
    return (
      <div className="relative h-full w-full rounded-xl bg-[#050505] grid">
        <Button
          className="bg-btn-purple hover:bg-btn-purple-hover m-auto"
          onClick={onStartClick}
        >
          Start Game
        </Button>
      </div>
    );
  }

  if (state.view === "end") {
    return (
      <div className="relative h-full w-full rounded-xl bg-[#050505] grid">
        <ScoreBoard p1={state.score1} p2={state.score2} />
        <Button
          className="bg-btn-purple hover:bg-btn-purple-hover m-auto"
          onClick={onStartClick}
        >
          Play Again
        </Button>
        <Button
          className="bg-btn-blue hover:bg-btn-blue-hover m-auto"
          onClick={onExitClick}
        >
          Return to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <GameStateDispatchContext value={dispatch}>
        <GameRender
          onScore={onScore}
          mode={state.mode}
          paused={state.paused}
          p1Score={state.score1}
          p2Score={state.score2}
        />
        <GameUI state={state} />
      </GameStateDispatchContext>
    </div>
  );
}
