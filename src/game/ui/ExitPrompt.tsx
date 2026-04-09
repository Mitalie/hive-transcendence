import Button from "@/components/Button";
import {
  exitCancelAction,
  exitConfirmAction,
  GameStateDispatch,
} from "../GameState";

export default function ExitModal({
  exitPromptOpen,
  dispatch,
}: {
  exitPromptOpen: boolean;
  dispatch: GameStateDispatch;
}) {
  if (!exitPromptOpen) return null;

  return (
    <div className="absolute inset-0 flex justify-center items-center rounded-xl">
      <div className="bg-card p-[30px] text-center rounded-xl shadow-lg">
        <p className="mb-5 text-3xl">Are you sure you want to end the game?</p>
        <div className="flex gap-2.5 justify-center">
          <Button
            className="bg-blue-dark hover:bg-purple-dark"
            onClick={() => dispatch(exitCancelAction())}
          >
            Return to Game
          </Button>
          <Button
            className="bg-btn-blue hover:bg-btn-blue-hover"
            onClick={() => dispatch(exitConfirmAction())}
          >
            End Game
          </Button>
        </div>
      </div>
    </div>
  );
}
