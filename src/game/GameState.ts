import { createContext, Dispatch, useEffect, useReducer, useRef } from "react";
import { GameConfig } from "@/game/GameConfig";
import { saveMatchAction } from "@/actions/matchHistory";

export type GameType = "classic" | "advanced";
export type GameOpponent = "human" | "easy" | "medium" | "hard";
export type GameView = "start" | "play" | "end";

// Requires game restart to change
export interface GameMode {
  type: GameType;
  opponent: GameOpponent;
}

// Updates dynamically
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GameSettings {
  // TODO - remove eslint comment above when adding first entry here
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
  | { type: "EXIT_CONFIRM" };

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

const checkWinCondition = (score1: number, score2: number): boolean => {
  const { winLimit, winByTwo } = GameConfig.rules;
  const limitReached = Math.max(score1, score2) >= winLimit;
  const winMargin = !winByTwo || Math.abs(score1 - score2) >= 2;
  return limitReached && winMargin;
};

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
        mode: { ...prev.mode }, // Create new instance of mode object to re-create engine
      };
    case "SCORE_P1":
    case "SCORE_P2":
      let { score1, score2 } = prev;
      if (action.type === "SCORE_P1") score1++;
      if (action.type === "SCORE_P2") score2++;
      if (checkWinCondition(score1, score2))
        return { ...prev, score1, score2, view: "end" };
      return { ...prev, score1, score2 };
    case "PAUSE":
      return { ...prev, paused: true };
    case "RESUME":
      return { ...prev, paused: false, menuOpen: false };
    case "OPEN_MENU":
      return { ...prev, paused: true, menuOpen: true };
    case "CLOSE_MENU":
      return { ...prev, menuOpen: false };
    case "EXIT_PROMPT":
      return { ...prev, paused: true, exitPromptOpen: true };
    case "EXIT_CANCEL":
      return { ...prev, exitPromptOpen: false };
    case "EXIT_CONFIRM":
      return { ...prev, view: "start", exitPromptOpen: false };
    default:
      throw new Error(
        `Unhandled action type: ${(action as { type: string }).type}`,
      );
  }
};

const initGameState: GameState = {
  mode: {
    type: "classic",
    opponent: "easy",
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
  const resultSaved = useRef(false);
  const saveResult = () => {
    if (state.view !== "end") {
      resultSaved.current = false;
      return;
    }
    if (resultSaved.current) return;
    resultSaved.current = true;
    saveMatchAction({
      player2: "local-player-2", // FIXME - replace with actual opponent identifier when available
      score1: state.score1,
      score2: state.score2,
    }).catch((error) => {
      // TODO - notify user of failure and allow retry
      console.error("Failed to save match:", error);
    });
  };
  useEffect(saveResult, [state.view, state.score1, state.score2]);

  return [state, dispatch] as const;
};

export const GameStateDispatchContext = createContext<
  Dispatch<GameStateAction>
>(() => {
  throw new Error("GameStateDispatchContext not provided");
});
