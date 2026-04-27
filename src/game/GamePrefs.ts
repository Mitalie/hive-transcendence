/**
 * GamePrefs.ts — browser cookie persistence for game preferences.
 *
 * Two separate cookies per logged-in user:
 * gameSetup_{name}    – setup screen choices (mode, opponent, difficulty, winScore)
 * gameSettings_{name} – GameConfig visual + physics values (colors, sliders)
 *
 * Written only when user explicitly confirms (Start Play / Apply).
 * Read on Game component mount to restore the previous session's configuration.
 */

import { GameConfig } from "@/game/GameConfig";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export interface SetupPrefs {
  gameType: "classic" | "advanced";
  opponent: "human" | "easy" | "medium" | "hard";
  aiDifficulty: "easy" | "medium" | "hard";
  winScore: 7 | 11 | 21;
}

export function saveSetupPrefs(displayName: string, prefs: SetupPrefs) {
  setCookie(`gameSetup_${displayName}`, JSON.stringify(prefs));
}

export function loadSetupPrefs(displayName: string): SetupPrefs | null {
  try {
    const raw = getCookie(`gameSetup_${displayName}`);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<SetupPrefs>;
    if (
      (p.gameType !== "classic" && p.gameType !== "advanced") ||
      !["human", "easy", "medium", "hard"].includes(p.opponent ?? "") ||
      !["easy", "medium", "hard"].includes(p.aiDifficulty ?? "") ||
      ![7, 11, 21].includes(p.winScore ?? 0)
    )
      return null;
    return p as SetupPrefs;
  } catch {
    return null;
  }
}

export interface SettingsPrefs {
  p1: string;
  p2: string;
  floorColor: string;
  netColor: string;
  glassColor: string;
  ballColor: string;
  ballSpeed: number;
  gravity: number;
  bounce: number;
  spin: number;
  paddleSpeed: number;
}

export function saveSettingsPrefs(displayName: string, prefs: SettingsPrefs) {
  setCookie(`gameSettings_${displayName}`, JSON.stringify(prefs));
}

export function loadSettingsPrefs(displayName: string): SettingsPrefs | null {
  try {
    const raw = getCookie(`gameSettings_${displayName}`);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<SettingsPrefs>;
    if (
      typeof p.p1 !== "string" ||
      typeof p.p2 !== "string" ||
      typeof p.ballSpeed !== "number" ||
      typeof p.gravity !== "number" ||
      typeof p.bounce !== "number" ||
      typeof p.spin !== "number" ||
      typeof p.paddleSpeed !== "number"
    )
      return null;
    return p as SettingsPrefs;
  } catch {
    return null;
  }
}

export function applySettingsToConfig(p: SettingsPrefs) {
  GameConfig.colors.p1 = p.p1;
  GameConfig.colors.p2 = p.p2;
  GameConfig.arena.floorColor = p.floorColor;
  GameConfig.arena.netColor = p.netColor;
  GameConfig.arena.glassColor = p.glassColor;
  GameConfig.arena.frameColor = p.glassColor;
  GameConfig.ballVisuals.color = p.ballColor;
  GameConfig.ballVisuals.emissive = p.ballColor;

  const bsf = p.ballSpeed / 5;
  GameConfig.ball.startVelocityX = Math.round(12 * bsf);
  GameConfig.ball.startVelocityZ = Math.round(10 * bsf);
  GameConfig.ball.maxXVelocity = Math.round(28 * bsf);
  // Synchronized scaling for maxZVelocity ensures physics stability at high speeds
  GameConfig.ball.maxZVelocity = Math.round(14 * bsf);

  GameConfig.ball.gravity = Math.round(5 + ((p.gravity - 1) / 9) * 35);
  GameConfig.ball.bounceFriction = parseFloat(
    (0.3 + ((p.bounce - 1) / 9) * 0.7).toFixed(2),
  );
  GameConfig.ball.swipeSpinFactor = parseFloat(
    (0.1 + ((p.spin - 1) / 9) * 1.1).toFixed(2),
  );

  const psf = p.paddleSpeed / 5;
  GameConfig.paddle.maxVelocity = Math.round(15 * psf);
  GameConfig.paddle.acceleration = Math.round(60 * psf);
}
