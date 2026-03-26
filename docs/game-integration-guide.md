# 🏓 Pong Engine Integration Guide

This document outlines the boundaries between the Game Logic (Engine), the 3D Frontend (Anssi), and the Database (Dimi).

## 🏗️ The Architecture

We use a "State-Driven" pattern. The engine (PongScheme.tsx) is a "dumb" physics loop. The rules and scoring live in a custom hook (useGameState.ts).

---

## 🎨 1. For Anssi (3D Assets & Lighting)

Location: The return block in src/components/game/PongScheme.tsx.

The engine uses basic Three.js boxGeometry as hitboxes. You should replace these placeholders with your actual 3D models or custom meshes.

CRITICAL: You must keep the ref (e.g., ref={paddle1Ref}) attached to your outermost 3D object. The physics engine uses these refs to move your art.

### Example Replacement:

Engine Placeholder:
<mesh ref={paddle1Ref} position={[GameConfig.player1.xPos, 0, 0]}>
<boxGeometry args={[GameConfig.paddle.width, GameConfig.paddle.height, GameConfig.paddle.depth]} />
<meshStandardMaterial color="blue" />
</mesh>

Your 3D Model:
<mesh ref={paddle1Ref} position={[GameConfig.player1.xPos, 0, 0]}>
<primitive object={yourImportedModel} />
</mesh>

---

## 💾 2. For Dimi (Database & Scoring)

Location: src/hooks/useGameState.ts

The scoring and win logic is now centralized in the hook. Dimi, you should hook into the handleScore function inside this file to trigger database saves.

NOTE: Ensure your payload matches the API Contract (v1.0) for Match History.

### How to Hook into the Database:

Inside useGameState.ts, when a player wins (p1Win or p2Win is true), trigger your Prisma/API logic.

    if (p1Win || p2Win)
    {
        setGameState("WON");
        // DIMI: Trigger Database Save Here
        // Payload should match API Contract: player1, player2, score1, score2, winner
        // await saveMatchToDB({ winner: player, finalScore: nextScore });
    }

## ⚙️ 3. Global Configuration

File: src/components/game/GameConfig.ts

All game constants and match rules live here.

- Anssi: Use these values to scale your 3D models so they match the hitboxes.
- Dimi: The winLimit (11) and deuce rules are controlled here.

  export const GameConfig =
  {
  paddle:
  {
  width: 0.5,
  height: 0.5,
  depth: 2,
  speed: 0.15,
  zLimit: 4
  },
  court:
  {
  width: 22,
  depth: 11,
  zLimit: 5,
  xLimit: 11
  },
  rules:
  {
  winLimit: 11,
  winByTwo: true
  }
  };

## ⌨️ 4. Game Controls

- SPACEBAR: The universal toggle. Cycles through START -> PLAYING -> PAUSED -> PLAYING.
- WIN RESET: If the state is WON, pressing SPACEBAR resets the score and restarts the match.
