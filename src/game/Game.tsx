"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GameConfig } from "@/game/GameConfig";
import {
  exitConfirmAction,
  GameMode,
  GameStateDispatchContext,
  closeMenuAction,
  pauseAction,
  resumeAction,
  scoreP1Action,
  scoreP2Action,
  setModeAction,
  startGameAction,
  useGameState,
} from "@/game/GameState";
import Button from "@/components/Button";
import GameUI from "@/game/ui/GameUI";
import GameRender from "@/game/3d/GameRender";
import GameSetup from "@/game/ui/GameSetup";
import { loadSettingsPrefs, applySettingsToConfig } from "@/game/GamePrefs";
import type { GameState } from "@/game/GameState";

// ── Settings snapshot ──────────────────────────────────────────────────────

type ConfigSnapshot = {
  p1: string;
  p2: string;
  floorColor: string;
  netColor: string;
  glassColor: string;
  frameColor: string;
  ballColor: string;
  ballEmissive: string;
  startVelocityX: number;
  startVelocityZ: number;
  maxXVelocity: number;
  gravity: number;
  bounceFriction: number;
  swipeSpinFactor: number;
  paddleMaxVelocity: number;
  paddleAcceleration: number;
};

function takeSnapshot(): ConfigSnapshot {
  return {
    p1: GameConfig.colors.p1,
    p2: GameConfig.colors.p2,
    floorColor: GameConfig.arena.floorColor,
    netColor: GameConfig.arena.netColor,
    glassColor: GameConfig.arena.glassColor,
    frameColor: GameConfig.arena.frameColor,
    ballColor: GameConfig.ballVisuals.color,
    ballEmissive: GameConfig.ballVisuals.emissive,
    startVelocityX: GameConfig.ball.startVelocityX,
    startVelocityZ: GameConfig.ball.startVelocityZ,
    maxXVelocity: GameConfig.ball.maxXVelocity,
    gravity: GameConfig.ball.gravity,
    bounceFriction: GameConfig.ball.bounceFriction,
    swipeSpinFactor: GameConfig.ball.swipeSpinFactor,
    paddleMaxVelocity: GameConfig.paddle.maxVelocity,
    paddleAcceleration: GameConfig.paddle.acceleration,
  };
}

function restoreSnapshot(s: ConfigSnapshot) {
  GameConfig.colors.p1 = s.p1;
  GameConfig.colors.p2 = s.p2;
  GameConfig.arena.floorColor = s.floorColor;
  GameConfig.arena.netColor = s.netColor;
  GameConfig.arena.glassColor = s.glassColor;
  GameConfig.arena.frameColor = s.frameColor;
  GameConfig.ballVisuals.color = s.ballColor;
  GameConfig.ballVisuals.emissive = s.ballEmissive;
  GameConfig.ball.startVelocityX = s.startVelocityX;
  GameConfig.ball.startVelocityZ = s.startVelocityZ;
  GameConfig.ball.maxXVelocity = s.maxXVelocity;
  GameConfig.ball.gravity = s.gravity;
  GameConfig.ball.bounceFriction = s.bounceFriction;
  GameConfig.ball.swipeSpinFactor = s.swipeSpinFactor;
  GameConfig.paddle.maxVelocity = s.paddleMaxVelocity;
  GameConfig.paddle.acceleration = s.paddleAcceleration;
}

// ── Component ──────────────────────────────────────────────────────────────

interface GameProps {
  isLoggedIn: boolean;
  /** The logged-in user's displayName — used as player label and cookie key. */
  playerName: string | null;
}

export default function Game({ isLoggedIn, playerName }: GameProps) {
  const { t } = useTranslation();
  // Pass isLoggedIn so useGameState knows whether to save
  const [state, dispatch] = useGameState(isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn || !playerName) return;
    const s = loadSettingsPrefs(playerName);
    if (s) applySettingsToConfig(s);
  }, []);

  const [guestName, setGuestName] = useState<string>("");
  const [showSetup, setShowSetup] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const settingsSnapshot = useRef<ConfigSnapshot | null>(null);
  const menuOpenRef = useRef(false);

  useEffect(() => {
    menuOpenRef.current = state.menuOpen;
  }, [state.menuOpen]);

  const prevMenuOpen = useRef(false);
  useEffect(() => {
    if (state.menuOpen && !prevMenuOpen.current) {
      settingsSnapshot.current = takeSnapshot();
    }
    prevMenuOpen.current = state.menuOpen;
  }, [state.menuOpen]);

  useEffect(() => {
    return () => {
      if (menuOpenRef.current && settingsSnapshot.current) {
        restoreSnapshot(settingsSnapshot.current);
      }
    };
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => {
      if (menuOpenRef.current && settingsSnapshot.current) {
        restoreSnapshot(settingsSnapshot.current);
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const closeSettingsWithRestore = useCallback(() => {
    if (settingsSnapshot.current) restoreSnapshot(settingsSnapshot.current);
    dispatch(closeMenuAction());
  }, [dispatch]);

  const onScore = useCallback(
    (player: 1 | 2) => {
      dispatch(player === 1 ? scoreP1Action() : scoreP2Action());
    },
    [dispatch],
  );

  const doStart = useCallback(() => {
    setGameStarted(true);
    dispatch(startGameAction());
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.exitPromptOpen) return;
      if (e.code !== GameConfig.ui.controls.togglePauseKey || e.repeat) return;
      e.preventDefault();
      if (state.menuOpen) {
        closeSettingsWithRestore();
        return;
      }
      if (state.view === "play" && !gameStarted) {
        doStart();
      } else if (state.view === "play" && state.paused) {
        dispatch(resumeAction());
      } else if (state.view === "play" && !state.paused) {
        dispatch(pauseAction());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    dispatch,
    state.paused,
    state.view,
    state.exitPromptOpen,
    state.menuOpen,
    gameStarted,
    doStart,
    closeSettingsWithRestore,
  ]);

  const handleSetupStart = useCallback(
    (mode: GameMode, guest?: string) => {
      dispatch(setModeAction(mode));

      const resolvedGuestName = guest ?? "";
      setGuestName(resolvedGuestName);

      GameConfig.matchHistory.currentPlayer2 =
        mode.opponent === "human"
          ? resolvedGuestName || t("game.lobby.player2")
          : `AI-${mode.opponent}`; // e.g. "AI-medium"

      setShowSetup(false);
    },
    [dispatch, t],
  );

  const onPlayAgain = useCallback(() => {
    setGameStarted(false);
    dispatch(startGameAction());
  }, [dispatch]);

  const resetToSetup = useCallback(() => {
    dispatch(exitConfirmAction());
    setShowSetup(true);
    setGuestName("");
    setGameStarted(false);
  }, [dispatch]);

  const p1Label = playerName ?? t("game.lobby.you");

  // ── Setup screen ──
  if (state.view === "start" && showSetup) {
    return (
      <GameSetup
        onStart={handleSetupStart}
        isLoggedIn={isLoggedIn}
        userId={playerName}
      />
    );
  }

  // ── Lobby ──
  if (state.view === "start" && !showSetup) {
    const opponentLabel =
      state.mode.opponent === "human"
        ? guestName || t("game.lobby.player2")
        : `AI · ${state.mode.opponent === "easy" ? t("game.lobby.aiEasy") : state.mode.opponent === "medium" ? t("game.lobby.aiMedium") : t("game.lobby.aiHard")}`;

    return (
      <div className="h-full w-full rounded-xl overflow-y-auto flex items-center justify-center">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col items-center gap-5 px-10 py-8 my-4 mx-4 select-none">
          <div className="text-text/50 text-xs tracking-widest uppercase">
            {t("game.lobby.readyToPlay")}
          </div>

          <div className="flex items-center gap-6">
            <span
              className="text-xl font-bold"
              style={{ color: GameConfig.colors.p1 }}
            >
              {p1Label}
            </span>
            <span className="text-text/30 text-sm">{t("game.lobby.vs")}</span>
            <span
              className="text-xl font-bold"
              style={{ color: GameConfig.colors.p2 }}
            >
              {opponentLabel}
            </span>
          </div>

          <div className="text-text/40 text-xs tracking-wider">
            {state.mode.type === "classic"
              ? t("game.lobby.classicMode")
              : t("game.lobby.advancedMode")}
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <Button
              className="bg-btn-purple hover:bg-btn-purple-hover"
              onClick={() => setShowSetup(true)}
            >
              {t("game.lobby.back")}
            </Button>
            <Button
              className="bg-btn-purple hover:bg-btn-purple-hover"
              onClick={() => {
                dispatch(startGameAction());
                setGameStarted(false);
              }}
            >
              {t("game.lobby.enterCourt")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── End screen ──
  if (state.view === "end") {
    return (
      <EndScreen
        isLoggedIn={isLoggedIn}
        p1Label={p1Label}
        guestName={guestName}
        state={state}
        onPlayAgain={onPlayAgain}
        onReturnToMenu={resetToSetup}
      />
    );
  }

  // ── Play view ──
  return (
    <div className="relative h-full w-full">
      <GameStateDispatchContext value={dispatch}>
        <GameRender
          onScore={onScore}
          mode={state.mode}
          paused={!gameStarted || state.paused}
          p1Score={state.score1}
          p2Score={state.score2}
        />
        <GameUI
          state={state}
          onApplyColors={() => {}}
          gameStarted={gameStarted}
          onStart={doStart}
          onExitConfirm={resetToSetup}
          isLoggedIn={isLoggedIn}
          userId={playerName}
        />
      </GameStateDispatchContext>
    </div>
  );
}

// ── End Screen ─────────────────────────────────────────────────────────────

function EndScreen({
  isLoggedIn,
  p1Label,
  guestName,
  state,
  onPlayAgain,
  onReturnToMenu,
}: {
  isLoggedIn: boolean;
  p1Label: string;
  guestName: string;
  state: GameState;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}) {
  const { t } = useTranslation();
  const p1Won = state.score1 > state.score2;
  const p2Label =
    state.mode.opponent === "human"
      ? guestName || t("game.lobby.player2")
      : `AI (${state.mode.opponent === "easy" ? t("game.lobby.aiEasy") : state.mode.opponent === "medium" ? t("game.lobby.aiMedium") : t("game.lobby.aiHard")})`;
  const winnerLabel = p1Won ? p1Label : p2Label;

  return (
    <div className="h-full w-full rounded-xl overflow-y-auto flex items-center justify-center">
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col items-center gap-5 px-10 py-8 my-4 mx-4 select-none">
        <div className="text-text/50 text-xs tracking-widest uppercase">
          {t("game.end.gameOver")}
        </div>

        <div
          className="text-3xl font-bold"
          style={{ color: p1Won ? GameConfig.colors.p1 : GameConfig.colors.p2 }}
        >
          {winnerLabel} {t("game.end.wins")}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text/50 tracking-wide">
              {p1Label}
            </span>
            <span
              className="text-3xl font-bold font-mono tabular-nums"
              style={{ color: GameConfig.colors.p1 }}
            >
              {String(state.score1).padStart(2, "0")}
            </span>
          </div>
          <span className="text-text/30 text-lg">—</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text/50 tracking-wide">
              {p2Label}
            </span>
            <span
              className="text-3xl font-bold font-mono tabular-nums"
              style={{ color: GameConfig.colors.p2 }}
            >
              {String(state.score2).padStart(2, "0")}
            </span>
          </div>
        </div>

        {!isLoggedIn && (
          <p className="text-xs text-text/50 text-center">
            {t("game.end.loginToSave")}
          </p>
        )}

        <div className="flex flex-col gap-3 w-full items-center mt-1">
          <Button
            className="bg-btn-purple hover:bg-btn-purple-hover w-48 justify-center"
            onClick={onPlayAgain}
          >
            {t("game.end.playAgain")}
          </Button>
          <Button
            className="bg-btn-blue hover:bg-btn-blue-hover w-48 justify-center"
            onClick={onReturnToMenu}
          >
            {t("game.end.mainMenu")}
          </Button>
        </div>
      </div>
    </div>
  );
}
