"use client";

import { useGameState } from "../../hooks/useGameState";
import { GameConfig } from "../../components/game/GameConfig";
import GameCanvas from "../../components/game/GameCanvas";

export default function SandboxPage() {
  // THE BRAIN: Pure game state, no frontend UI fluff needed here.
  const { score, gameState, handleScore } = useGameState(
    GameConfig.rules.winLimit,
  );

  return (
    <main
      style={{
        width: "100%",
        backgroundColor: "#111", // Shrink-wraps perfectly around the game
        marginBottom: "auto", // Pushes the entire block to the top of the screen
        position: "relative",
      }}
    >
      {/* --- RAW DEBUG OVERLAY ---
        This floats over the canvas to give you instant engine feedback.
      */}
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

      {/* --- THE ENGINE TEST BED ---
        Uses the exact GameCanvas wrapper from the main site to ensure
        1:1 camera and aspect ratio parity with production.
      */}
      <div style={{ width: "100%", position: "relative" }}>
        <GameCanvas onScore={handleScore} gameState={gameState} />
      </div>
    </main>
  );
}
