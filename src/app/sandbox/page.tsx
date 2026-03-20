"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import PongScheme from "../../components/game/PongScheme";

export default function SandboxPage() {
  // --- SCORE STATE ---
  const [score, setScore] = useState({ p1: 0, p2: 0 });

  // This function gets passed down to the game engine
  const handleScore = (player: 1 | 2) => {
    if (player === 1) {
      setScore((prev) => ({ ...prev, p1: prev.p1 + 1 }));
    } else {
      setScore((prev) => ({ ...prev, p2: prev.p2 + 1 }));
    }
  };

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#111",
        position: "relative",
      }}
    >
      {/* --- THE SCOREBOARD OVERLAY --- */}
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
        <span style={{ color: "blue" }}>{score.p1}</span> -{" "}
        <span style={{ color: "red" }}>{score.p2}</span>
      </div>

      <Canvas camera={{ position: [0, 25, 0], fov: 50 }}>
        {/* We pass the handleScore function INTO the 3D engine as a prop */}
        <PongScheme onScore={handleScore} />
      </Canvas>
    </main>
  );
}
