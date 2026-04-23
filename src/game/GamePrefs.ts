/**
 * gamePrefs.ts
 *
 * Thin helpers for persisting game setup choices and GameConfig settings
 * in browser cookies — same pattern as the dark-mode / language cookies in
 * Footer.tsx / layout.tsx.
 *
 * Two separate cookies:
 *   "gameSetup"    – setup screen choices (mode, opponent, difficulty, winScore)
 *   "gameSettings" – GameConfig visual + physics values (colors, sliders)
 *
 * Both are written only when the logged-in user explicitly confirms
 * (Start Play / Apply).  They are read on component mount to restore state.
 */

import { GameConfig } from "@/game/GameConfig";

// ── Cookie helpers ────────────────────────────────────────────────────────

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// ── Setup prefs ───────────────────────────────────────────────────────────

export interface SetupPrefs {
  gameType: "classic" | "advanced";
  opponent: "human" | "easy" | "medium" | "hard";
  aiDifficulty: "easy" | "medium" | "hard";
  winScore: 7 | 11 | 21;
}

function setupKey(displayName: string) {
  return `gameSetup_${displayName}`;
}

export function saveSetupPrefs(displayName: string, prefs: SetupPrefs) {
  setCookie(setupKey(displayName), JSON.stringify(prefs));
}

export function loadSetupPrefs(displayName: string): SetupPrefs | null {
  try {
    const raw = getCookie(setupKey(displayName));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<SetupPrefs>;
    // Validate each field — reject malformed cookies
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

// ── Settings prefs ────────────────────────────────────────────────────────

export interface SettingsPrefs {
  // Colors
  p1: string;
  p2: string;
  floorColor: string;
  netColor: string;
  glassColor: string;
  ballColor: string;
  // Physics (1-10 scale values)
  ballSpeed: number;
  gravity: number;
  bounce: number;
  spin: number;
  paddleSpeed: number;
}

function settingsKey(displayName: string) {
  return `gameSettings_${displayName}`;
}

export function saveSettingsPrefs(displayName: string, prefs: SettingsPrefs) {
  setCookie(settingsKey(displayName), JSON.stringify(prefs));
}

export function loadSettingsPrefs(displayName: string): SettingsPrefs | null {
  try {
    const raw = getCookie(settingsKey(displayName));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<SettingsPrefs>;
    // Basic shape check
    if (
      typeof p.p1 !== "string" ||
      typeof p.p2 !== "string" ||
      typeof p.ballSpeed !== "number"
    )
      return null;
    return p as SettingsPrefs;
  } catch {
    return null;
  }
}

/**
 * Apply a SettingsPrefs object directly to GameConfig.
 * Used on page load / component mount to restore persisted settings.
 */
export function applySettingsToConfig(p: SettingsPrefs) {
  GameConfig.colors.p1 = p.p1;
  GameConfig.colors.p2 = p.p2;
  GameConfig.arena.floorColor = p.floorColor;
  GameConfig.arena.netColor = p.netColor;
  GameConfig.arena.glassColor = p.glassColor;
  GameConfig.arena.frameColor = p.glassColor; // frameColor mirrors glassColor
  GameConfig.ballVisuals.color = p.ballColor;
  GameConfig.ballVisuals.emissive = p.ballColor;

  const bsf = p.ballSpeed / 5;
  GameConfig.ball.startVelocityX = Math.round(12 * bsf);
  GameConfig.ball.startVelocityZ = Math.round(10 * bsf);
  GameConfig.ball.maxXVelocity = Math.round(28 * bsf);

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
