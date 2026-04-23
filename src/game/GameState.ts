import { createContext, Dispatch, useEffect, useReducer, useRef } from "react";
import { GameConfig } from "@/game/GameConfig";
import { saveMatchAction } from "@/actions/matchHistory";

export type GameType = "classic" | "advanced";
export type GameOpponent = "human" | "easy" | "medium" | "hard";
export type GameView = "start" | "play" | "end";

export interface GameMode {
  type: GameType;
  opponent: GameOpponent;
}

// Strict interface that requires all properties to be explicitly defined.
// Temporarily uses a 'never' placeholder to satisfy ESLint's no-empty-object-type
// rule without needing a suppression comment, while strictly rejecting unknown properties.
export interface GameSettings {
  _placeholder?: never;
}

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
  | { type: "SET_SETTINGS"; settings: Partial<GameSettings> }
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
export const setSettingsAction = (
  settings: Partial<GameSettings>,
): GameStateAction => ({
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

function isWinningScore(mine: number, theirs: number): boolean {
  if (!GameConfig.rules.winByTwo) return mine >= GameConfig.rules.winLimit;
  return mine >= GameConfig.rules.winLimit && mine - theirs >= 2;
}

const gameStateReducer = (
  state: GameState,
  action: GameStateAction,
): GameState => {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "START_GAME":
      return {
        ...state,
        view: "play",
        score1: 0,
        score2: 0,
        paused: false,
        menuOpen: false,
        exitPromptOpen: false,
        mode: { ...state.mode },
      };
    case "SCORE_P1":
    case "SCORE_P2": {
      // Unified scoring handles both players to prevent code duplication,
      // naturally transitioning the view to "end" when limits are reached.
      let { score1, score2 } = state;
      if (action.type === "SCORE_P1") score1++;
      if (action.type === "SCORE_P2") score2++;

      // Check both players — either reaching the limit ends the game
      return {
        ...state,
        score1,
        score2,
        view:
          isWinningScore(score1, score2) || isWinningScore(score2, score1)
            ? "end"
            : state.view,
      };
    }
    case "PAUSE":
      return { ...state, paused: true };
    case "RESUME":
      return {
        ...state,
        paused: false,
        menuOpen: false,
        exitPromptOpen: false,
      };
    case "OPEN_MENU":
      return { ...state, paused: true, menuOpen: true };
    case "CLOSE_MENU":
      return { ...state, menuOpen: false };
    case "EXIT_PROMPT":
      return { ...state, exitPromptOpen: true, paused: true };
    case "EXIT_CANCEL":
      return { ...state, exitPromptOpen: false };
    case "EXIT_CONFIRM":
      return {
        ...state,
        view: "start",
        exitPromptOpen: false,
        menuOpen: false,
        paused: false,
      };
    case "RESTORE_DEFAULTS":
      return {
        ...state,
        mode: {
          type: GameConfig.defaults.mode as GameType,
          opponent: GameConfig.defaults.opponent as GameOpponent,
        },
        settings: {},
      };
    default:
      // Catch programmer mistakes to ensure we never silently dispatch unrecognized actions.
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

export const useGameState = (isLoggedIn: boolean) => {
  const [state, dispatch] = useReducer(gameStateReducer, initGameState);
  const resultSaved = useRef(false);

  useEffect(() => {
    if (state.view !== "end") {
      resultSaved.current = false;
      return;
    }

    if (!isLoggedIn || resultSaved.current) return;
    resultSaved.current = true;

    const player2 = GameConfig.matchHistory.currentPlayer2;

    saveMatchAction({
      player2,
      score1: state.score1,
      score2: state.score2,
    }).then((result) => {
      if (!result.ok) {
        console.error("Match History API Failure", result.error);
      }
    });
  }, [isLoggedIn, state.view, state.score1, state.score2]);

  return [state, dispatch] as const;
};

export const GameStateDispatchContext = createContext<
  Dispatch<GameStateAction>
>(() => {
  throw new Error("GameStateDispatchContext not provided");
});
