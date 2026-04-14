"use client";

import { useCallback, useEffect } from "react";
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

/**
 * TOP-LEVEL GAME ORCHESTRATOR
 * Acts as the primary container for the Pong application. This component
 * initializes the Finite State Machine (FSM), manages global input listeners,
 * and routes high-level view rendering between 'start', 'play', and 'end' states.
 */
export default function Game() {
  const [state, dispatch] = useGameState();

  /**
   * Memoized scoring bridge.
   * Injected into the 3D physics loop to trigger state transitions
   * across the React/Three.js boundary.
   */
  const onScore = useCallback(
    (player: 1 | 2) => {
      dispatch(player === 1 ? scoreP1Action() : scoreP2Action());
    },
    [dispatch],
  );

  /**
   * Global Input Orchestration
   * Maps hardware keyboard events to FSM transitions based on current context.
   * Utilizes the 'togglePauseKey' defined in GameConfig for centralized control.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Input suppression during critical dialog focus
      if (state.exitPromptOpen) return;

      if (e.code === GameConfig.ui.controls.togglePauseKey && !e.repeat) {
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

  // --- START SCREEN VIEW ---
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

  // --- MATCH TERMINATION VIEW ---
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

  // --- ACTIVE SIMULATION VIEW ---
  // Employs Context Provider pattern to allow deep UI components
  // (GameUI, ExitPrompt) to dispatch actions without prop-drilling.
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
