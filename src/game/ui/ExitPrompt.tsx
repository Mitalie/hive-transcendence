import { use } from "react";
import { useTranslation } from "react-i18next";
import {
  exitCancelAction,
  exitConfirmAction,
  GameStateDispatchContext,
} from "@/game/GameState";
import Button from "@/components/Button";

export default function ExitModal({
  exitPromptOpen,
  onConfirm,
}: {
  exitPromptOpen: boolean;
  /** Called after dispatching exitConfirmAction — use to reset local UI state */
  onConfirm?: () => void;
}) {
  // Hooks must be called unconditionally — before any early return.
  const dispatch = use(GameStateDispatchContext);
  const { t } = useTranslation();

  if (!exitPromptOpen) return null;

  return (
    <div className="absolute inset-0 flex justify-center items-center rounded-xl z-30 pointer-events-none">
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col items-center gap-5 px-10 py-8 select-none pointer-events-auto">
        <span className="text-3xl font-bold tracking-wide text-text">
          {t("game.exit.title")}
        </span>
        <div className="flex gap-3">
          <Button
            className="w-48 py-3 bg-btn-purple hover:bg-btn-purple-hover font-semibold"
            onClick={() => dispatch(exitCancelAction())}
          >
            {t("game.exit.keepPlaying")}
          </Button>
          <Button
            className="w-48 py-3 bg-btn-purple-hover hover:opacity-90 font-semibold"
            onClick={() => {
              dispatch(exitConfirmAction());
              onConfirm?.();
            }}
          >
            {t("game.exit.endGame")}
          </Button>
        </div>
      </div>
    </div>
  );
}
