"use client";

import { Canvas } from "@react-three/fiber";
import PongScheme from "../../components/game/PongScheme";
import { GameConfig } from "../../components/game/GameConfig";
import { useGameState } from "../../hooks/useGameState";

export default function SandboxPage() {
  // THE BRAIN: We pull the game state and scoring logic from our custom hook.
  // We feed it the winLimit directly from our central GameConfig.
  const { score, gameState, handleScore } = useGameState(
    GameConfig.rules.winLimit,
  );

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#111",
        position: "relative", // Required so the absolute-positioned scoreboard floats on top
      }}
    >
      {/* --- THE UI OVERLAY ---
        This div sits ON TOP of the 3D canvas. Because it's standard React,
        the frontend team can easily replace these inline styles with Tailwind
        or custom CSS later without breaking the 3D game underneath.
        'pointerEvents: "none"' ensures clicks pass through to the 3D canvas if needed.
      */}
      <div
        style={{
          position: "absolute",
          top: 40,
          width: "100%",
          textAlign: "center",
          color: "white",
          fontSize: "5rem",
          fontWeight: "bold",
          fontFamily: "monospace",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {/* Player Scores */}
        <span style={{ color: "blue" }}>{score.p1}</span> -{" "}
        <span style={{ color: "red" }}>{score.p2}</span>
        {/* Dynamic Game State Messages (Reacts to the Spacebar toggles) */}
        {gameState === "START" && (
          <div
            style={{ fontSize: "1.5rem", color: "white", marginTop: "10px" }}
          >
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
            {/* FRONTEND/DIMI NOTE: "Player 1/2" will eventually be replaced
              with real usernames pulled from the Auth session.
            */}
            PLAYER {score.p1 > score.p2 ? "1" : "2"} WINS!
            <div style={{ fontSize: "1rem", color: "white" }}>
              PRESS SPACE TO RESTART
            </div>
          </div>
        )}
      </div>

      {/* --- THE 3D WORLD ---
        The Canvas acts as the window into the Three.js environment.
        Everything inside here runs on the GPU and the 60fps useFrame loop.
      */}
      <Canvas
        camera={{
          position: GameConfig.camera.position,
          fov: GameConfig.camera.fov,
        }}
      >
        <color attach="background" args={["#050505"]} />

        {/* THE ENGINE: We pass the handleScore function so the physics loop
          can tell React when a goal happens. We pass gameState so the engine
          knows when to freeze the physics (e.g., during PAUSED or WON states).
        */}
        <PongScheme onScore={handleScore} gameState={gameState} />
      </Canvas>
    </main>
  );
}
