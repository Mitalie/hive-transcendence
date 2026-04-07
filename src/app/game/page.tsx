// game page

"use client";

import GameCanvas from "@/components/game/GameCanvas";
import GameUI from "@/components/game/GameUI";

// HOOKS/CONFIG
import { useGameState } from "@/hooks/useGameState";
import { GameConfig } from "@/game/GameConfig";

export default function GamePage() {
  const { score, gameState, handleScore, setGameState } = useGameState(
    GameConfig.rules.winLimit,
  );

  return (
    <div className="relative h-full w-full">
      <GameCanvas onScore={handleScore} gameState={gameState} />
      <GameUI score={score} gameState={gameState} setGameState={setGameState} />
    </div>
  );
}
