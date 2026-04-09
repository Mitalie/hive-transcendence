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

export default function GameUI({ state }: { state: GameState }) {
  const { view, paused, score1, score2, menuOpen, exitPromptOpen } = state;
  const dispatch = use(GameStateDispatchContext);

  return (
    <>
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

      {state.paused && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/50 rounded-xl">
          <div
            className="flex items-center justify-center w-32 h-32 bg-card rounded-2xl text-7xl select-none cursor-pointer"
            onClick={() => dispatch(resumeAction())}
          >
            ▶
          </div>
        </div>
      )}

      <ExitModal exitPromptOpen={state.exitPromptOpen} />
    </>
  );
}
