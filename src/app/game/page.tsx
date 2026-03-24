// game page

"use client";

import { useState } from "react";
import Controls from "@/components/game/Controls";
import ScoreBoard from "@/components/game/ScoreBoard";
import GameCanvas from "@/components/game/GameCanvas";
import GameSettings from "@/components/game/GameSettings";
import ConfirmModal from "@/components/game/ConfirmModal";

export default function GamePage() {
  const [playing, setPlaying] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <Controls
          playing={playing}
          onStart={() => setPlaying(true)}
          onStop={() => setPlaying(false)}
          onEnd={() => setShowEndModal(true)}
        />

        <div className="flex gap-2.5 items-center">
          <ScoreBoard />
          <button
            className="px-4 py-2 rounded-xl bg-button text-text hover:bg-button-hover transition-colors"
            onClick={() => setShowSettings(true)}
          >
            ⚙
          </button>
        </div>
      </div>

      <div className="relative">
        <GameCanvas />

        {showSettings && (
          <div className="absolute right-5 top-5">
            <GameSettings onClose={() => setShowSettings(false)} />
          </div>
        )}

        <ConfirmModal
          visible={showEndModal}
          onCancel={() => setShowEndModal(false)}
          onConfirm={() => {
            setPlaying(false);
            setShowEndModal(false);
          }}
        />
      </div>
    </div>
  );
}
