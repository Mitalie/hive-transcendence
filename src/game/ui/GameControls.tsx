import Button from "@/components/Button";
import { useTranslation } from "react-i18next";
import {
  GameStateDispatch,
  GameView,
  pauseAction,
  resumeAction,
  startGameAction,
} from "../GameState";

export default function GameControls({
  view,
  paused,
  dispatch,
  openEndModal,
}: {
  view: GameView;
  paused: boolean;
  dispatch: GameStateDispatch;
  openEndModal: () => void;
}) {
  const { t } = useTranslation();

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
            onClick={openEndModal}
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
            onClick={openEndModal}
          >
            {t("gamecontrols.end")}
          </Button>
        </>
      )}
    </div>
  );
}
