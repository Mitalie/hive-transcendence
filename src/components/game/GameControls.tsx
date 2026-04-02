"use client";

import Button from "@/components/Button";
import { useTranslation } from "react-i18next";

type Props = {
  gameState: "START" | "PLAYING" | "PAUSED" | "WON";
  onStart: () => void;
  onPause: () => void;
  onContinue: () => void;
  onEnd: () => void;
};

export default function GameControls({
  gameState,
  onStart,
  onPause,
  onContinue,
  onEnd,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2.5 items-center">
      {(gameState === "START" || gameState === "WON") && (
        <Button onClick={onStart}>{t("gamecontrols.start")}</Button>
      )}

      {gameState === "PLAYING" && (
        <>
          <Button onClick={onPause}>{t("gamecontrols.pause")}</Button>
          <Button onClick={onEnd}>{t("gamecontrols.end")}</Button>
        </>
      )}

      {gameState === "PAUSED" && (
        <>
          <Button onClick={onContinue}>{t("gamecontrols.continue")}</Button>
          <Button onClick={onEnd}>{t("gamecontrols.end")}</Button>
        </>
      )}
    </div>
  );
}
