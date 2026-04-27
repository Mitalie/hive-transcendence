"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/Button";
import { GameConfig } from "@/game/GameConfig";
import { saveSettingsPrefs } from "@/game/GamePrefs";

type Props = {
  onClose?: () => void;
  onApply?: () => void;
  isLoggedIn?: boolean;
  userId?: string | null;
  gameMode?: "classic" | "advanced";
};

// Evaluated at module load to capture original factory configurations before any cookies are applied
const DEFAULT_COLORS = {
  p1: GameConfig.colors.p1,
  p2: GameConfig.colors.p2,
  floorColor: GameConfig.arena.floorColor,
  netColor: GameConfig.arena.netColor,
  wallColor: GameConfig.arena.glassColor,
  ballColor: GameConfig.ballVisuals.color,
} as const;

const BASE_BALL_VX = 12;
const BASE_BALL_VZ = 10;
const BASE_BALL_MAX = 28;
const BASE_PADDLE_VEL = 15;
const BASE_PADDLE_ACCEL = 60;

function ballSpeedToScale(vx: number) {
  return Math.round((vx / BASE_BALL_VX) * 5);
}
function scaleToBallSpeed(s: number) {
  const f = s / 5;
  GameConfig.ball.startVelocityX = Math.round(BASE_BALL_VX * f);
  GameConfig.ball.startVelocityZ = Math.round(BASE_BALL_VZ * f);
  GameConfig.ball.maxXVelocity = Math.round(BASE_BALL_MAX * f);
  GameConfig.ball.maxZVelocity = Math.round(14 * f);
}

function gravityToScale(g: number) {
  return Math.round(((g - 5) / 35) * 9) + 1;
}
function scaleToGravity(s: number) {
  GameConfig.ball.gravity = Math.round(5 + ((s - 1) / 9) * 35);
}

function bounceToScale(b: number) {
  return Math.round(((b - 0.3) / 0.7) * 9) + 1;
}
function scaleToBounce(s: number) {
  GameConfig.ball.bounceFriction = parseFloat(
    (0.3 + ((s - 1) / 9) * 0.7).toFixed(2),
  );
}

function spinToScale(sp: number) {
  return Math.round(((sp - 0.1) / 1.1) * 9) + 1;
}
function scaleToSpin(s: number) {
  GameConfig.ball.swipeSpinFactor = parseFloat(
    (0.1 + ((s - 1) / 9) * 1.1).toFixed(2),
  );
}

function paddleSpeedToScale(v: number) {
  return Math.round((v / BASE_PADDLE_VEL) * 5);
}
function scaleToPaddleSpeed(s: number) {
  const f = s / 5;
  GameConfig.paddle.maxVelocity = Math.round(BASE_PADDLE_VEL * f);
  GameConfig.paddle.acceleration = Math.round(BASE_PADDLE_ACCEL * f);
}

function readSnapshot() {
  return {
    p1: GameConfig.colors.p1,
    p2: GameConfig.colors.p2,
    floorColor: GameConfig.arena.floorColor,
    netColor: GameConfig.arena.netColor,
    wallColor: GameConfig.arena.glassColor,
    ballColor: GameConfig.ballVisuals.color,
    ballSpeed: ballSpeedToScale(GameConfig.ball.startVelocityX),
    gravity: gravityToScale(GameConfig.ball.gravity),
    bounce: bounceToScale(GameConfig.ball.bounceFriction),
    spin: spinToScale(GameConfig.ball.swipeSpinFactor),
    paddleSpeed: paddleSpeedToScale(GameConfig.paddle.maxVelocity),
  };
}

type Tab = "colors" | "physics";

export default function GameSettingPanel({
  onClose,
  onApply,
  isLoggedIn = false,
  userId = null,
  gameMode = "classic",
}: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("colors");

  const [p1Color, setP1Color] = useState(GameConfig.colors.p1);
  const [p2Color, setP2Color] = useState(GameConfig.colors.p2);
  const [floorColor, setFloorColor] = useState(GameConfig.arena.floorColor);
  const [netColor, setNetColor] = useState(GameConfig.arena.netColor);
  const [wallColor, setWallColor] = useState(GameConfig.arena.glassColor);
  const [ballColor, setBallColor] = useState(GameConfig.ballVisuals.color);

  const [ballSpeed, setBallSpeed] = useState(() =>
    ballSpeedToScale(GameConfig.ball.startVelocityX),
  );
  const [gravity, setGravity] = useState(() =>
    gravityToScale(GameConfig.ball.gravity),
  );
  const [bounce, setBounce] = useState(() =>
    bounceToScale(GameConfig.ball.bounceFriction),
  );
  const [spin, setSpin] = useState(() =>
    spinToScale(GameConfig.ball.swipeSpinFactor),
  );
  const [paddleSpeed, setPaddleSpeed] = useState(() =>
    paddleSpeedToScale(GameConfig.paddle.maxVelocity),
  );

  const snapshot = useRef(readSnapshot());

  const handleP1Color = useCallback((v: string) => {
    setP1Color(v);
    GameConfig.colors.p1 = v;
  }, []);
  const handleP2Color = useCallback((v: string) => {
    setP2Color(v);
    GameConfig.colors.p2 = v;
  }, []);
  const handleFloorColor = useCallback((v: string) => {
    setFloorColor(v);
    GameConfig.arena.floorColor = v;
  }, []);
  const handleNetColor = useCallback((v: string) => {
    setNetColor(v);
    GameConfig.arena.netColor = v;
  }, []);
  const handleWallColor = useCallback((v: string) => {
    setWallColor(v);
    GameConfig.arena.glassColor = v;
    GameConfig.arena.frameColor = v;
  }, []);
  const handleBallColor = useCallback((v: string) => {
    setBallColor(v);
    GameConfig.ballVisuals.color = v;
    GameConfig.ballVisuals.emissive = v;
  }, []);

  const handleBallSpeed = useCallback((s: number) => {
    setBallSpeed(s);
    scaleToBallSpeed(s);
  }, []);
  const handleGravity = useCallback((s: number) => {
    setGravity(s);
    scaleToGravity(s);
  }, []);
  const handleBounce = useCallback((s: number) => {
    setBounce(s);
    scaleToBounce(s);
  }, []);
  const handleSpin = useCallback((s: number) => {
    setSpin(s);
    scaleToSpin(s);
  }, []);
  const handlePaddleSpeed = useCallback((s: number) => {
    setPaddleSpeed(s);
    scaleToPaddleSpeed(s);
  }, []);

  const handleApply = useCallback(() => {
    snapshot.current = readSnapshot();

    if (isLoggedIn && userId) {
      saveSettingsPrefs(userId, {
        p1: GameConfig.colors.p1,
        p2: GameConfig.colors.p2,
        floorColor: GameConfig.arena.floorColor,
        netColor: GameConfig.arena.netColor,
        glassColor: GameConfig.arena.glassColor,
        ballColor: GameConfig.ballVisuals.color,
        ballSpeed: ballSpeedToScale(GameConfig.ball.startVelocityX),
        gravity: gravityToScale(GameConfig.ball.gravity),
        bounce: bounceToScale(GameConfig.ball.bounceFriction),
        spin: spinToScale(GameConfig.ball.swipeSpinFactor),
        paddleSpeed: paddleSpeedToScale(GameConfig.paddle.maxVelocity),
      });
    }
    onApply?.();
    onClose?.();
  }, [isLoggedIn, userId, onApply, onClose]);

  // Restore snapshot and close (✕ button, Space key, backdrop)
  const handleClose = useCallback(() => {
    const s = snapshot.current;
    handleP1Color(s.p1);
    handleP2Color(s.p2);
    handleFloorColor(s.floorColor);
    handleNetColor(s.netColor);
    handleWallColor(s.wallColor);
    handleBallColor(s.ballColor);
    handleBallSpeed(s.ballSpeed);
    handleGravity(s.gravity);
    handleBounce(s.bounce);
    handleSpin(s.spin);
    handlePaddleSpeed(s.paddleSpeed);
    onClose?.();
  }, [
    handleP1Color,
    handleP2Color,
    handleFloorColor,
    handleNetColor,
    handleWallColor,
    handleBallColor,
    handleBallSpeed,
    handleGravity,
    handleBounce,
    handleSpin,
    handlePaddleSpeed,
    onClose,
  ]);

  const handleReset = useCallback(() => {
    handleP1Color(DEFAULT_COLORS.p1);
    handleP2Color(DEFAULT_COLORS.p2);
    handleFloorColor(DEFAULT_COLORS.floorColor);
    handleNetColor(DEFAULT_COLORS.netColor);
    handleWallColor(DEFAULT_COLORS.wallColor);
    handleBallColor(DEFAULT_COLORS.ballColor);
    handleBallSpeed(5);
    handlePaddleSpeed(5);

    if (gameMode === "advanced") {
      handleGravity(5);
      handleBounce(7);
      handleSpin(5);
    }
  }, [
    handleP1Color,
    handleP2Color,
    handleFloorColor,
    handleNetColor,
    handleWallColor,
    handleBallColor,
    handleBallSpeed,
    handlePaddleSpeed,
    handleGravity,
    handleBounce,
    handleSpin,
    gameMode,
  ]);

  return (
    <div
      className="bg-card w-[260px] rounded-xl shadow-2xl overflow-y-auto"
      style={{ maxHeight: "calc(100dvh - 220px)" }}
    >
      <div className="flex flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wider uppercase text-text/70">
            {t("game.settings.title")}
          </span>
          <Button
            onClick={handleClose}
            className="bg-btn-purple hover:bg-btn-purple-hover !px-2 !py-1 text-xs"
          >
            {t("game.settings.close")}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg p-1 gap-1 bg-text/10">
          {(["colors", "physics"] as Tab[]).map((tabKey) => (
            <Button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={[
                "flex-1 rounded-md",
                tab === tabKey
                  ? "bg-btn-purple opacity-100"
                  : "bg-transparent opacity-50",
              ].join(" ")}
            >
              {tabKey === "colors"
                ? t("game.settings.tabColors")
                : t("game.settings.tabPhysics")}
            </Button>
          ))}
        </div>

        {/* Colors */}
        {tab === "colors" && (
          <div className="flex flex-col gap-2.5">
            <ColorRow
              label={t("game.settings.p1Color")}
              value={p1Color}
              onChange={handleP1Color}
            />
            <ColorRow
              label={t("game.settings.p2Color")}
              value={p2Color}
              onChange={handleP2Color}
            />
            <ColorRow
              label={t("game.settings.floor")}
              value={floorColor}
              onChange={handleFloorColor}
            />
            <ColorRow
              label={t("game.settings.net")}
              value={netColor}
              onChange={handleNetColor}
            />
            <ColorRow
              label={t("game.settings.glassWalls")}
              value={wallColor}
              onChange={handleWallColor}
            />
            <ColorRow
              label={t("game.settings.ball")}
              value={ballColor}
              onChange={handleBallColor}
            />
          </div>
        )}

        {/* Physics */}
        {tab === "physics" && (
          <div className="flex flex-col gap-3">
            <SliderRow
              label={t("game.settings.ballSpeed")}
              value={ballSpeed}
              min={1}
              max={10}
              step={1}
              onChange={handleBallSpeed}
            />
            {gameMode === "advanced" && (
              <>
                <SliderRow
                  label={t("game.settings.ballGravity")}
                  value={gravity}
                  min={1}
                  max={10}
                  step={1}
                  onChange={handleGravity}
                />
                <SliderRow
                  label={t("game.settings.ballBounce")}
                  value={bounce}
                  min={1}
                  max={10}
                  step={1}
                  onChange={handleBounce}
                />
                <SliderRow
                  label={t("game.settings.ballSpin")}
                  value={spin}
                  min={1}
                  max={10}
                  step={1}
                  onChange={handleSpin}
                />
              </>
            )}
            <SliderRow
              label={t("game.settings.paddleSpeed")}
              value={paddleSpeed}
              min={1}
              max={10}
              step={1}
              onChange={handlePaddleSpeed}
            />
          </div>
        )}

        <div className="flex gap-2 pt-1 border-t border-btn-purple">
          <Button
            onClick={handleReset}
            className="flex-1 font-semibold bg-btn-purple hover:bg-btn-purple-hover"
          >
            {t("game.settings.reset")}
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 font-semibold bg-btn-purple-hover hover:opacity-90"
          >
            {t("game.settings.apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm flex-1 text-left text-text/80">{label}</span>
      <label className="relative cursor-pointer flex-shrink-0">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
        />
        <div
          className="w-8 h-8 rounded-lg shadow-sm transition-transform hover:scale-110 border-2 border-btn-purple"
          style={{ backgroundColor: value }}
        />
      </label>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-text/80">{label}</span>
        <span className="text-sm font-mono font-semibold tabular-nums text-text/70">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-btn-purple-hover) 0%, var(--color-btn-purple-hover) ${pct}%, var(--color-btn-purple) ${pct}%, var(--color-btn-purple) 100%)`,
        }}
      />
    </div>
  );
}
