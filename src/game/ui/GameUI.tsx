import { use } from "react";
import { useTranslation } from "react-i18next";
import {
  GameState,
  GameStateDispatchContext,
  exitPromptAction,
  resumeAction,
} from "@/game/GameState";
import GameSettingButton from "@/game/ui/GameSettingButton";
import ExitModal from "@/game/ui/ExitPrompt";
import Button from "@/components/Button";

export default function GameUI({
  state,
  onApplyColors,
  gameStarted,
  onStart,
  onExitConfirm,
  isLoggedIn = false,
  userId = null,
  gameMode = "classic",
}: {
  state: GameState;
  onApplyColors: () => void;
  gameStarted: boolean;
  onStart: () => void;
  onExitConfirm?: () => void;
  isLoggedIn?: boolean;
  userId?: string | null;
  gameMode?: "classic" | "advanced";
}) {
  const { paused, menuOpen, exitPromptOpen } = state;
  const dispatch = use(GameStateDispatchContext);
  const { t } = useTranslation();

  return (
    <>
      {menuOpen && <div className="absolute inset-0 z-30 rounded-xl" />}

      {/* Settings button + panel */}
      <div className="absolute top-[15px] right-[15px] z-50">
        <GameSettingButton
          open={menuOpen}
          onApplyColors={onApplyColors}
          isLoggedIn={isLoggedIn}
          userId={userId}
          gameMode={gameMode}
        />
      </div>

      {/* Ready prompt */}
      {!gameStarted && (
        <div className="absolute inset-0 flex flex-col justify-center items-center rounded-xl z-10 pointer-events-none">
          <div
            className={[
              "bg-card backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col items-center gap-3",
              "px-8 py-6 sm:px-10 sm:py-8 select-none cursor-pointer max-h-[80vh]",
              menuOpen ? "pointer-events-none" : "pointer-events-auto",
            ].join(" ")}
            onClick={onStart}
          >
            <span className="text-2xl sm:text-3xl font-bold tracking-wide text-text">
              {t("game.play.ready")}
            </span>
            {menuOpen ? (
              <span className="text-xs sm:text-sm text-text/50 tracking-widest uppercase">
                {t("game.play.settingOpen")}
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-text/50 tracking-widest uppercase">
                {t("game.play.clickOrSpace")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Paused overlay */}
      {gameStarted && paused && !exitPromptOpen && (
        <div className="absolute inset-0 flex flex-col justify-center items-center rounded-xl z-10 pointer-events-none">
          <div
            className={[
              "bg-card backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col items-center",
              "gap-4 px-6 py-6 sm:gap-5 sm:px-10 sm:py-8 select-none max-h-[80vh]",
              menuOpen ? "pointer-events-none" : "pointer-events-auto",
            ].join(" ")}
          >
            <span className="text-2xl sm:text-3xl font-bold tracking-wide text-text">
              {t("game.play.paused")}
            </span>
            {menuOpen ? (
              <span className="text-xs sm:text-sm text-text/50 tracking-widest uppercase">
                {t("game.play.settingOpen")}
              </span>
            ) : (
              <div className="flex gap-2 sm:gap-3">
                <Button
                  className="w-32 sm:w-40 py-2.5 sm:py-3 bg-btn-purple hover:bg-btn-purple-hover font-semibold justify-center"
                  onClick={() => dispatch(resumeAction())}
                >
                  {t("game.play.continue")}
                </Button>
                <Button
                  className="w-32 sm:w-40 py-2.5 sm:py-3 bg-btn-purple hover:bg-btn-purple-hover font-semibold justify-center"
                  onClick={() => dispatch(exitPromptAction())}
                >
                  {t("game.play.endGame")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <ExitModal exitPromptOpen={exitPromptOpen} onConfirm={onExitConfirm} />
    </>
  );
}
