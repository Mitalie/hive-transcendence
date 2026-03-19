// game page

"use client";

import { useState } from "react";
import Controls from "../components/game/Controls";
import ScoreBoard from "../components/game/ScoreBoard";
import GameCanvas from "../components/game/GameCanvas";
import GameSettings from "../components/game/GameSettings";
import ConfirmModal from "../components/game/ConfirmModal";

export default function GamePage() {
  const [playing, setPlaying] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <Controls
          playing={playing}
          onStart={() => setPlaying(true)}
          onStop={() => setPlaying(false)}
          onEnd={() => setShowEndModal(true)}
        />

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <ScoreBoard />
          <button className="button" onClick={() => setShowSettings(true)}>
            ⚙
          </button>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <GameCanvas />

        {showSettings && (
          <div style={{
            position: "absolute",
            right: "20px",
            top: "20px"
          }}>
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