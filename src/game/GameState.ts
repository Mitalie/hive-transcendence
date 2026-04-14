import { createContext, Dispatch, useEffect, useReducer, useRef } from "react";
import { GameConfig } from "@/game/GameConfig";
import { saveMatchAction } from "@/actions/matchHistory";

export type GameType = "classic" | "advanced";
export type GameOpponent = "human" | "easy" | "medium" | "hard";
export type GameView = "start" | "play" | "end";

/**
 * GameMode defines the immutable match parameters required for engine initialization.
 */
export interface GameMode {
  type: GameType;
  opponent: GameOpponent;
}

/**
 * GameSettings permits dynamic runtime adjustments to the user environment.
 */
export type GameSettings = Record<string, unknown>;

export interface GameState {
  mode: GameMode;
  settings: GameSettings;
  view: GameView;
  score1: number;
  score2: number;
  menuOpen: boolean;
  paused: boolean;
  exitPromptOpen: boolean;
}

type GameStateAction =
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "SET_SETTINGS"; settings: GameSettings }
  | { type: "START_GAME" }
  | { type: "SCORE_P1" }
  | { type: "SCORE_P2" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "OPEN_MENU" }
  | { type: "CLOSE_MENU" }
  | { type: "EXIT_PROMPT" }
  | { type: "EXIT_CANCEL" }
  | { type: "EXIT_CONFIRM" }
  | { type: "RESTORE_DEFAULTS" };

export const setModeAction = (mode: GameMode): GameStateAction => ({
  type: "SET_MODE",
  mode,
});
export const setSettingsAction = (settings: GameSettings): GameStateAction => ({
  type: "SET_SETTINGS",
  settings,
});
export const startGameAction = (): GameStateAction => ({ type: "START_GAME" });
export const scoreP1Action = (): GameStateAction => ({ type: "SCORE_P1" });
export const scoreP2Action = (): GameStateAction => ({ type: "SCORE_P2" });
export const pauseAction = (): GameStateAction => ({ type: "PAUSE" });
export const resumeAction = (): GameStateAction => ({ type: "RESUME" });
export const openMenuAction = (): GameStateAction => ({ type: "OPEN_MENU" });
export const closeMenuAction = (): GameStateAction => ({ type: "CLOSE_MENU" });
export const exitPromptAction = (): GameStateAction => ({
  type: "EXIT_PROMPT",
});
export const exitCancelAction = (): GameStateAction => ({
  type: "EXIT_CANCEL",
});
export const exitConfirmAction = (): GameStateAction => ({
  type: "EXIT_CONFIRM",
});
export const restoreDefaultsAction = (): GameStateAction => ({
  type: "RESTORE_DEFAULTS",
});

/**
 * Evaluates match termination against the global ruleset.
 * Ensures strict compliance with dynamic 'winLimit' and 'winByTwo' configurations.
 */
const checkWinCondition = (score1: number, score2: number): boolean => {
  const { winLimit, winByTwo } = GameConfig.rules;
  const limitReached = Math.max(score1, score2) >= winLimit;
  const winMargin = !winByTwo || Math.abs(score1 - score2) >= 2;

  return limitReached && winMargin;
};

/**
 * Finite State Machine (FSM) Reducer
 * Enforces strict, deterministic state transitions and prevents illegal UI overlapping.
 */
const gameStateReducer = (
  prev: GameState,
  action: GameStateAction,
): GameState => {
  switch (action.type) {
    case "SET_MODE":
      return { ...prev, mode: action.mode };
    case "SET_SETTINGS":
      return { ...prev, settings: action.settings };
    case "START_GAME":
      return {
        ...prev,
        view: "play",
        score1: 0,
        score2: 0,
        paused: false,
        menuOpen: false,
        exitPromptOpen: false,
        // Cloning the mode object forces React to trigger a new reference,
        // which cleanly signals the GameRender useMemo to rebuild the PongEngine.
        mode: { ...prev.mode },
      };
    case "SCORE_P1":
    case "SCORE_P2": {
      // STRICT GUARD: Prevents "Ghost Points" from registering if the physics engine
      // processes a goal boundary collision while the game is paused or already over.
      if (prev.view !== "play" || prev.paused) return prev;

      let { score1, score2 } = prev;
      if (action.type === "SCORE_P1") score1++;
      if (action.type === "SCORE_P2") score2++;

      if (checkWinCondition(score1, score2)) {
        return { ...prev, score1, score2, view: "end", paused: true };
      }

      return { ...prev, score1, score2 };
    }
    case "PAUSE":
      return { ...prev, paused: true };
    case "RESUME":
      return { ...prev, paused: false, menuOpen: false, exitPromptOpen: false };
    case "OPEN_MENU":
      return { ...prev, paused: true, menuOpen: true };
    case "CLOSE_MENU":
      return { ...prev, menuOpen: false };
    case "EXIT_PROMPT":
      return { ...prev, paused: true, exitPromptOpen: true };
    case "EXIT_CANCEL":
      return { ...prev, exitPromptOpen: false };
    case "EXIT_CONFIRM":
      // A full exit mathematically resets all overlapping UI states
      return {
        ...prev,
        view: "start",
        paused: false,
        menuOpen: false,
        exitPromptOpen: false,
      };
    case "RESTORE_DEFAULTS":
      // Reverts the match configuration to the immutable blueprint in GameConfig.
      return {
        ...prev,
        mode: {
          type: GameConfig.defaults.mode as GameType,
          opponent: GameConfig.defaults.opponent as GameOpponent,
        },
        settings: {},
      };
    default:
      throw new Error(
        `Unhandled action type: ${(action as { type: string }).type}`,
      );
  }
};

const initGameState: GameState = {
  mode: {
    type: GameConfig.defaults.mode as GameType,
    opponent: GameConfig.defaults.opponent as GameOpponent,
  },
  settings: {},
  view: "start",
  score1: 0,
  score2: 0,
  menuOpen: false,
  paused: false,
  exitPromptOpen: false,
};

export const useGameState = () => {
  const [state, dispatch] = useReducer(gameStateReducer, initGameState);

  // Ref-based guard to prevent duplicate network requests during React strict-mode
  // reconciliation or rapid multi-frame renders upon match termination.
  const resultSaved = useRef(false);

  useEffect(() => {
    if (state.view !== "end") {
      resultSaved.current = false;
      return;
    }

    if (resultSaved.current) return;
    resultSaved.current = true;

    // Dynamically formats the database identifier to distinguish human vs AI matches
    const opponentId =
      state.mode.opponent === "human"
        ? "local-player-2"
        : `ai-${state.mode.opponent}`;

    saveMatchAction({
      player2: opponentId,
      score1: state.score1,
      score2: state.score2,
    }).catch((error) => {
      console.error(
        "Match History API Failure: Unable to persist result.",
        error,
      );
    });
  }, [state.view, state.score1, state.score2, state.mode.opponent]);

  return [state, dispatch] as const;
};

export const GameStateDispatchContext = createContext<
  Dispatch<GameStateAction>
>(() => {
  throw new Error("GameStateDispatchContext not provided");
});
