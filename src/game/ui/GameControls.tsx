import { use } from "react";
import { useTranslation } from "react-i18next";
import {
  GameStateDispatchContext,
  GameView,
  exitPromptAction,
  pauseAction,
  resumeAction,
  startGameAction,
} from "@/game/GameState";
import Button from "@/components/Button";

export default function GameControls({
  view,
  paused,
}: {
  view: GameView;
  paused: boolean;
}) {
  const { t } = useTranslation();
  const dispatch = use(GameStateDispatchContext);

  return (
    <div className="flex gap-2.5 items-center">
      {(view === "start" || view === "end") && (
        <Button
          className="bg-btn-purple hover:bg-btn-purple-hover"
          onClick={() => dispatch(startGameAction())}
        >
          {t("gamecontrols.start")}
        </Button>
      )}

      {view === "play" && !paused && (
        <>
          <Button
            className="bg-btn-purple hover:bg-btn-purple-hover"
            onClick={() => dispatch(pauseAction())}
          >
            {t("gamecontrols.pause")}
          </Button>
          <Button
            className="bg-btn-purple hover:bg-btn-purple-hover"
            onClick={() => dispatch(exitPromptAction())}
          >
            {t("gamecontrols.end")}
          </Button>
        </>
      )}

      {view === "play" && paused && (
        <>
          <Button
            className="bg-btn-purple hover:bg-btn-purple-hover"
            onClick={() => dispatch(resumeAction())}
          >
            {t("gamecontrols.continue")}
          </Button>
          <Button
            className="bg-btn-purple hover:bg-btn-purple-hover"
            onClick={() => dispatch(exitPromptAction())}
          >
            {t("gamecontrols.end")}
          </Button>
        </>
      )}
    </div>
  );
}
