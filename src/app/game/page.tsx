// game page

"use client";

import { useState, useEffect } from "react";
import Controls from "@/components/game/Controls";
import ScoreBoard from "@/components/game/ScoreBoard";
import GameCanvas from "@/components/game/GameCanvas";
import GameSettings from "@/components/game/GameSettings";
import ConfirmModal from "@/components/game/ConfirmModal";

// HOOKS/CONFIG
import { useGameState } from "../../hooks/useGameState";
import { GameConfig } from "../../components/game/GameConfig";

export default function GamePage() {
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { score, gameState, handleScore, setGameState } = useGameState(
    GameConfig.rules.winLimit,
  );

  const isPlaying = gameState === "PLAYING";

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <Controls
          playing={isPlaying}
          onStart={() => setGameState("PLAYING")}
          onStop={() => setGameState("PAUSED")}
          onEnd={() => setShowEndModal(true)}
        />

        <div className="flex gap-2.5 items-center">
          <ScoreBoard p1={score.p1} p2={score.p2} />
          <button
            className="px-4 py-2 rounded-xl bg-button text-text hover:bg-button-hover transition-colors"
            onClick={() => setShowSettings(true)}
          >
            ⚙
          </button>
        </div>
      </div>

      <div className="relative">
        <GameCanvas onScore={handleScore} gameState={gameState} />

        {showSettings && (
          <div className="absolute right-5 top-5 z-20">
            <GameSettings onClose={() => setShowSettings(false)} />
          </div>
        )}

        <ConfirmModal
          visible={showEndModal}
          onCancel={() => setShowEndModal(false)}
          onConfirm={() => {
            setGameState("START");
            setShowEndModal(false);
          }}
        />
      </div>
    </div>
  );
}
