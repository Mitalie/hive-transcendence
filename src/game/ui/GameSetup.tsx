"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { GameConfig } from "@/game/GameConfig";
import { GameMode, GameOpponent, GameType } from "@/game/GameState";
import { loadSetupPrefs, saveSetupPrefs } from "@/game/GamePrefs";
import Button from "@/components/Button";

interface GameSetupProps {
  onStart: (mode: GameMode, guestName?: string) => void;
  isLoggedIn: boolean;
  userId: string | null;
}

const WIN_SCORE_OPTIONS = [7, 11, 21] as const;
type WinScore = (typeof WIN_SCORE_OPTIONS)[number];

export default function GameSetup({
  onStart,
  isLoggedIn,
  userId,
}: GameSetupProps) {
  const { t } = useTranslation();

  const initialPrefs = isLoggedIn && userId ? loadSetupPrefs(userId) : null;

  const [selectedType, setSelectedType] = useState<GameType>(
    initialPrefs?.gameType ?? "classic",
  );
  const [selectedOpponent, setSelectedOpponent] = useState<GameOpponent>(
    initialPrefs?.opponent === "human"
      ? "human"
      : (initialPrefs?.opponent ?? "medium"),
  );
  const [guestName, setGuestName] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">(
    initialPrefs?.aiDifficulty ?? "medium",
  );
  const [winScore, setWinScore] = useState<WinScore>(
    initialPrefs?.winScore ?? 11,
  );

  const isAI = selectedOpponent !== "human";

  const requiresLogin =
    !isLoggedIn &&
    (selectedType === "advanced" || selectedOpponent === "human");

  const canStart =
    !requiresLogin &&
    (isAI || (guestName.trim().length > 0 && guestName.length <= 20));

  const handleWinScore = useCallback((v: WinScore) => setWinScore(v), []);

  const handleStart = useCallback(() => {
    if (!canStart) return;
    const opponent: GameOpponent =
      selectedOpponent === "human" ? "human" : aiDifficulty;
    GameConfig.rules.winLimit = winScore;

    if (isLoggedIn && userId) {
      saveSetupPrefs(userId, {
        gameType: selectedType,
        opponent: selectedOpponent === "human" ? "human" : aiDifficulty,
        aiDifficulty,
        winScore,
      });
    }

    onStart({ type: selectedType, opponent }, guestName || undefined);
  }, [
    selectedType,
    selectedOpponent,
    aiDifficulty,
    guestName,
    winScore,
    canStart,
    isLoggedIn,
    userId,
    onStart,
  ]);

  return (
    <div className="h-full w-full overflow-y-auto" suppressHydrationWarning>
      <div className="min-h-full flex items-center justify-center py-8 px-4 sm:px-6">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-5 sm:gap-7 md:gap-8">
          {/* Game Mode */}
          <section className="flex flex-col gap-2 sm:gap-3">
            <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-widest text-text font-medium">
              {t("game.setup.gameMode")}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <OptionCard
                title={t("game.setup.classic")}
                description={t("game.setup.classicDesc")}
                selected={selectedType === "classic"}
                onClick={() => setSelectedType("classic")}
              />
              <OptionCard
                title={t("game.setup.advanced")}
                description={t("game.setup.advancedDesc")}
                selected={selectedType === "advanced"}
                onClick={() => setSelectedType("advanced")}
                locked={!isLoggedIn}
              />
            </div>
          </section>

          {/* Opponent */}
          <section className="flex flex-col gap-2 sm:gap-3">
            <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-widest text-text font-medium">
              {t("game.setup.opponent")}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <OptionCard
                title={t("game.setup.ai")}
                description={t("game.setup.aiDesc")}
                selected={isAI}
                onClick={() => setSelectedOpponent("medium")}
              />
              <OptionCard
                title={t("game.setup.guest")}
                description={t("game.setup.guestDesc")}
                selected={selectedOpponent === "human"}
                onClick={() => setSelectedOpponent("human")}
                locked={!isLoggedIn}
              />
            </div>
          </section>

          {/* AI difficulty */}
          {isAI && (
            <section className="flex flex-col gap-2 sm:gap-3">
              <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-widest text-text font-medium">
                {t("game.setup.difficulty")}
              </p>
              <div className="flex gap-2 sm:gap-3">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <SelectChip
                    key={d}
                    label={t(`game.setup.${d}`)}
                    selected={aiDifficulty === d}
                    onClick={() => setAiDifficulty(d)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Guest name */}
          {selectedOpponent === "human" && (
            <section className="flex flex-col gap-2 sm:gap-3">
              <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-widest text-text font-medium">
                {t("game.setup.player2Name")}
              </p>
              <input
                type="text"
                maxLength={20}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={t("game.setup.player2Placeholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canStart) handleStart();
                }}
                className={[
                  "w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg text-center text-text bg-card border outline-none placeholder:text-text/25",
                  guestName.length > 20
                    ? "border-red-500 focus:border-red-500"
                    : "border-text/10 focus:border-purple-dark",
                ].join(" ")}
              />
              {guestName.length > 20 && (
                <p className="text-xs text-red-500 text-center">
                  {t("game.setup.player2MaxLength")}
                </p>
              )}
            </section>
          )}

          {/* Win Score */}
          <section className="flex flex-col gap-2 sm:gap-3">
            <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-widest text-text font-medium">
              {t("game.setup.winScore")}
            </p>
            <div className="flex gap-2 sm:gap-3">
              {WIN_SCORE_OPTIONS.map((v) => (
                <SelectChip
                  key={v}
                  label={String(v)}
                  selected={winScore === v}
                  onClick={() => handleWinScore(v)}
                />
              ))}
            </div>
          </section>

          {/* Login-required hint */}
          {requiresLogin && (
            <p className="text-xs text-red-500 text-center -mb-2">
              {t("game.setup.loginToUnlock")}
            </p>
          )}

          {/* Start */}
          <Button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full font-semibold text-white bg-linear-to-r from-blue-dark to-purple-dark disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("game.setup.startPlay")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  title,
  description,
  selected,
  onClick,
  locked = false,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  locked?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      className={[
        "relative flex flex-col gap-1 sm:gap-1.5 px-3.5 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 text-left transition-colors duration-150 border",
        selected
          ? "bg-card border-purple-dark"
          : "bg-card/70 border-card/70 hover:border-purple-dark",
        locked ? "opacity-50" : "",
      ].join(" ")}
    >
      <span
        className={[
          "text-sm sm:text-base md:text-lg font-semibold",
          selected ? "text-purple-dark" : "text-text/50",
        ].join(" ")}
      >
        {title}
      </span>
      <span className="text-[11px] sm:text-xs md:text-sm text-text/40 leading-snug">
        {description}
      </span>
    </Button>
  );
}

function SelectChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className={[
        "flex-1 py-2 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-medium border transition-colors duration-150",
        selected
          ? "bg-card border-purple-dark text-purple-dark"
          : "bg-card/70 border-card/70 text-text/50 hover:border-purple-dark",
      ].join(" ")}
    >
      {label}
    </Button>
  );
}
