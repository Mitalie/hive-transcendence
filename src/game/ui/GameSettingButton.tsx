import { useCallback, use } from "react";
import {
  closeMenuAction,
  GameStateDispatchContext,
  openMenuAction,
} from "@/game/GameState";
import GameSettingPanel from "@/game/ui/GameSettingPanel";
import Button from "@/components/Button";

export default function GameSettingButton({
  open,
  onApplyColors,
  isLoggedIn = false,
  userId = null,
}: {
  open: boolean;
  onApplyColors: () => void;
  isLoggedIn?: boolean;
  userId?: string | null;
}) {
  const dispatch = use(GameStateDispatchContext);

  const openPanel = useCallback(() => dispatch(openMenuAction()), [dispatch]);
  const closePanel = useCallback(() => dispatch(closeMenuAction()), [dispatch]);

  const togglePanel = useCallback(() => {
    if (open) closePanel();
    else openPanel();
  }, [open, openPanel, closePanel]);

  return (
    <div className="relative z-50">
      <Button
        onClick={togglePanel}
        className={`w-9 h-9 flex items-center justify-center
          ${open ? "bg-btn-purple-active" : "bg-card"}
          hover:bg-btn-purple-hover
        `}
        aria-label="Settings"
      >
        ⚙️
      </Button>

      {open && (
        <div className="absolute right-0 top-[48px] z-50">
          <GameSettingPanel
            onClose={closePanel}
            onApply={onApplyColors}
            isLoggedIn={isLoggedIn}
            userId={userId}
          />
        </div>
      )}
    </div>
  );
}
