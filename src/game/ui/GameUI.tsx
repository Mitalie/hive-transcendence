import { useState } from "react";
import GameControls from "./GameControls";
import ScoreBoard from "./ScoreBoard";
import GameSettingButton from "./GameSettingButton";
import ConfirmModal from "./ConfirmModal";

interface GameUIProps {
  score: { p1: number; p2: number };
  gameState: "START" | "PLAYING" | "PAUSED" | "WON";
  setGameState: (state: "START" | "PLAYING" | "PAUSED" | "WON") => void;
}

export default function GameUI({
  score,
  gameState,
  setGameState,
}: GameUIProps) {
  const [showEndModal, setShowEndModal] = useState(false);

  return (
    <>
      <div
        className={`absolute top-[15px] left-[15px] right-[15px] flex items-center justify-between z-10
                 ${showEndModal ? "pointer-events-none opacity-50" : ""}`}
      >
        <GameControls
          gameState={gameState}
          onStart={() => setGameState("PLAYING")}
          onPause={() => setGameState("PAUSED")}
          onContinue={() => setGameState("PLAYING")}
          onEnd={() => {
            setGameState("PAUSED");
            setShowEndModal(true);
          }}
        />

        <div className="absolute left-1/2 -translate-x-1/2">
          <ScoreBoard p1={score.p1} p2={score.p2} />
        </div>

        <GameSettingButton gameState={gameState} setGameState={setGameState} />
      </div>

      <ConfirmModal
        visible={showEndModal}
        onCancel={() => setShowEndModal(false)}
        onConfirm={() => {
          setGameState("START");
          setShowEndModal(false);
        }}
      />

      {gameState === "PAUSED" && !showEndModal && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/50 rounded-xl">
          <div
            className="flex items-center justify-center w-32 h-32 bg-card rounded-2xl text-7xl select-none cursor-pointer"
            onClick={() => setGameState("PLAYING")}
          >
            ▶
          </div>
        </div>
      )}
    </>
  );
}
