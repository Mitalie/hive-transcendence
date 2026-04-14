import { use } from "react";
import {
  GameState,
  GameStateDispatchContext,
  resumeAction,
} from "@/game/GameState";
import GameControls from "@/game/ui/GameControls";
import ScoreBoard from "@/game/ui/ScoreBoard";
import GameSettingButton from "@/game/ui/GameSettingButton";
import ExitModal from "@/game/ui/ExitPrompt";

/**
 * PRIMARY UI OVERLAY
 * Manages the 2D interface layer above the 3D Canvas. Coordinates the HUD,
 * pause state overlays, and modal prompts.
 */
export default function GameUI({ state }: { state: GameState }) {
  const { view, paused, score1, score2, menuOpen, exitPromptOpen } = state;
  const dispatch = use(GameStateDispatchContext);

  return (
    <>
      {/* TOP HUD BAR
          Contains match controls, live scoreboard, and setting triggers.
          Interactivity is suppressed when an exit prompt is active to prevent focus stealing.
      */}
      <div
        className={`absolute top-[15px] left-[15px] right-[15px] flex items-center justify-between z-10
                 ${exitPromptOpen ? "pointer-events-none opacity-50" : ""}`}
      >
        <GameControls view={view} paused={paused} />

        <div className="absolute left-1/2 -translate-x-1/2">
          <ScoreBoard p1={score1} p2={score2} />
        </div>

        <GameSettingButton open={menuOpen} />
      </div>

      {/* PAUSE OVERLAY
          'pointer-events-none' on the container allows 360-degree camera orbiting
          while the game is paused. Interactivity is surgical: only the Play button
          captures mouse events via 'pointer-events-auto'.
      */}
      {state.paused && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/50 rounded-xl pointer-events-none">
          <div
            className="flex items-center justify-center w-32 h-32 bg-card rounded-2xl text-7xl select-none cursor-pointer pointer-events-auto shadow-2xl transition-transform hover:scale-105 active:scale-95"
            onClick={() => dispatch(resumeAction())}
          >
            ▶
          </div>
        </div>
      )}

      {/* MATCH TERMINATION MODAL */}
      <ExitModal exitPromptOpen={state.exitPromptOpen} />
    </>
  );
}
