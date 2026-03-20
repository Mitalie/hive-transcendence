"use client";

import PongScene from "../components/PongScene";

export default function GamePage() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>Pong Game</h1>
      <PongScene />
    </div>
  );
}