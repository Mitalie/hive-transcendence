import { useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  closeMenuAction,
  GameStateDispatch,
  openMenuAction,
} from "@/game/GameState";
import GameSettingPanel from "@/game/ui/GameSettingPanel";
import Button from "@/components/Button";

export default function GameSettingButton({
  open,
  dispatch,
}: {
  open: boolean;
  dispatch: GameStateDispatch;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const toggleSettingPanel = useCallback(() => {
    if (open) dispatch(closeMenuAction());
    else dispatch(openMenuAction());
  }, [dispatch, open]);

  const closeSettingPanel = useCallback(() => {
    if (open) dispatch(closeMenuAction());
  }, [dispatch, open]);

  // close setting panel when click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        dispatch(closeMenuAction());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch, open]);

  return (
    <div>
      <Button
        ref={buttonRef}
        onClick={toggleSettingPanel}
        className={`
          ${open ? "bg-btn-purple-active" : "bg-btn-purple"}
          hover:bg-btn-purple-hover
        `}
      >
        {t("gamesetting.settingbtn")}
      </Button>
      {open && (
        <div className="relative">
          <div ref={panelRef} className="absolute right-[0] top-[15px] z-20">
            <GameSettingPanel onClose={closeSettingPanel} />
          </div>
        </div>
      )}
    </div>
  );
}
