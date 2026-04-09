import { useState, useRef, useEffect } from "react";
import Button from "@/components/Button";
import GameSettingPanel from "./GameSettingPanel";
import { useTranslation } from "react-i18next";

type Props = {
  gameState: "START" | "PLAYING" | "PAUSED" | "WON";
  setGameState: (state: "START" | "PLAYING" | "PAUSED" | "WON") => void;
};

export default function GameSettingButton({ gameState, setGameState }: Props) {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  // make the setting button toggled, and set the position for setting panel
  const openSettingPanel = () => {
    if (open) {
      setOpen(false);
      return;
    }

    if (gameState === "PLAYING") {
      setGameState("PAUSED");
    }
    setOpen(true);
  };

  // close setting panel when click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!open) return;

      const target = e.target as Node;

      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div>
      <Button
        ref={buttonRef}
        onClick={openSettingPanel}
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
            <GameSettingPanel onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
