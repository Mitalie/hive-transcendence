"use client";

import { useCallback, useEffect, useRef } from "react";
import { GameConfig } from "@/game/GameConfig";
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

  // useReducer dispatch is stable, but we use a ref for state to allow listeners
  // to read the current context without re-registering on every state change.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;

      if (s.exitPromptOpen) return;

      if (e.code === GameConfig.ui.controls.togglePauseKey && !e.repeat) {
        if (s.view !== "play") dispatch(startGameAction());
        else if (s.paused) dispatch(resumeAction());
        else dispatch(pauseAction());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const onStartClick = useCallback(() => {
    dispatch(startGameAction());
  }, [dispatch]);

  const onExitClick = useCallback(() => {
    dispatch(exitConfirmAction());
  }, [dispatch]);

  if (state.view === "start") {
    return (
      <div
        className="relative h-full w-full rounded-xl grid"
        style={{ backgroundColor: GameConfig.ui.backgroundColor }}
      >
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
      <div
        className="relative h-full w-full rounded-xl grid"
        style={{ backgroundColor: GameConfig.ui.backgroundColor }}
      >
        <ScoreBoard p1={state.score1} p2={state.score2} />
        <div className="m-auto flex flex-col gap-4">
          <Button
            className="bg-btn-purple hover:bg-btn-purple-hover"
            onClick={onStartClick}
          >
            Play Again
          </Button>
          <Button
            className="bg-btn-blue hover:bg-btn-blue-hover"
            onClick={onExitClick}
          >
            Return to Menu
          </Button>
        </div>
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
