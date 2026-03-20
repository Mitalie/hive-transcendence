# 🏓 Pong Engine Integration Guide

This document outlines the boundaries between the Game Logic (Engine), the 3D Frontend (Anssi), and the Database (Dimi).

## 🏗️ The Architecture

We use a "Dumb Engine" pattern. The engine (PongScheme.tsx) handles math and physics in a 60fps loop using useRef. It does not handle 3D textures or API calls.

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

Location: The Next.js parent page (e.g., src/app/sandbox/page.tsx).

The engine is decoupled from the database. It simply accepts a function called onScore as a prop. It calls this function whenever the ball passes a paddle.

### How to Hook into the Database:

In the parent page, use the onScore callback to check if a player has reached the winning total. When they win, trigger your Prisma/API logic to save the result to MariaDB.

const handleScore = async (player: 1 | 2) =>
{
const newScore = player === 1 ? score.p1 + 1 : score.p2 + 1;

    if (newScore >= 5)
    {
        // DIMI: Trigger Database Save Here
        // await saveMatchToDB({ winner: player, finalScore: score });
    }

};

---

## ⚙️ 3. Global Configuration

File: src/components/game/GameConfig.ts

All game constants (speed, paddle size, wall limits) live here.

- Anssi: Use these values to scale your 3D models so they match the hitboxes.
- Logic: The engine math updates automatically when these values change.

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
player1: { xPos: -8 },
player2: { xPos: 8 },
ball:
{
radius: 0.3,
startVelocityX: 0.1,
startVelocityZ: 0.08
}
};
