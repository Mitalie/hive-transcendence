"use client";

import { useState } from "react";
import { useGameState } from "../../hooks/useGameState";
import { GameConfig } from "../../components/game/GameConfig";
import GameCanvas from "../../components/game/GameCanvas";

export default function SandboxPage() {
  // THE BRAIN: Pure game state, no frontend UI fluff needed here.
  const { score, gameState, handleScore } = useGameState(
    GameConfig.rules.winLimit,
  );

  // The toggle state! Defaults to our new awesome physics.
  const [gameMode, setGameMode] = useState<"classic" | "advanced">("advanced");

  return (
    <main
      style={{
        width: "100%",
        backgroundColor: "#111",
        marginBottom: "auto",
        position: "relative",
      }}
    >
      {/* --- DEBUG TOGGLE MENU --- */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 20,
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setGameMode("classic")}
          style={{
            padding: "8px 16px",
            backgroundColor: gameMode === "classic" ? "white" : "#333",
            color: gameMode === "classic" ? "black" : "white",
            border: "1px solid white",
            cursor: "pointer",
            fontFamily: "monospace",
          }}
        >
          CLASSIC
        </button>
        <button
          onClick={() => setGameMode("advanced")}
          style={{
            padding: "8px 16px",
            backgroundColor: gameMode === "advanced" ? "red" : "#333",
            color: gameMode === "advanced" ? "white" : "white",
            border: "1px solid red",
            cursor: "pointer",
            fontFamily: "monospace",
          }}
        >
          CYBER PADEL
        </button>
      </div>

      {/* --- RAW DEBUG OVERLAY --- */}
      <div
        style={{
          position: "absolute",
          top: 40,
          width: "100%",
          textAlign: "center",
          color: "white",
          fontSize: "3rem",
          fontWeight: "bold",
          fontFamily: "monospace",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {/* Raw Scores */}
        <span style={{ color: "blue" }}>{score.p1}</span> -{" "}
        <span style={{ color: "red" }}>{score.p2}</span>
        {/* Engine State Flags */}
        {gameState === "START" && (
          <div style={{ fontSize: "1.5rem", marginTop: "10px" }}>
            PRESS SPACE TO START
          </div>
        )}
        {gameState === "PAUSED" && (
          <div
            style={{ fontSize: "1.5rem", color: "yellow", marginTop: "10px" }}
          >
            GAME PAUSED
          </div>
        )}
        {gameState === "WON" && (
          <div style={{ fontSize: "2rem", color: "gold", marginTop: "10px" }}>
            PLAYER {score.p1 > score.p2 ? "1" : "2"} WINS!
            <div style={{ fontSize: "1rem", color: "white" }}>
              PRESS SPACE TO RESTART
            </div>
          </div>
        )}
      </div>

      {/* --- THE ENGINE TEST BED --- */}
      <div style={{ width: "100%", position: "relative" }}>
        {/* Pass the gameMode prop into your Canvas! */}
        <GameCanvas
          onScore={handleScore}
          gameState={gameState}
          mode={gameMode}
        />
      </div>
    </main>
  );
}
