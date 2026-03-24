"use client";

import { useEffect, useState } from "react";

type Match = {
  id: number;
  opponentType: string;
  opponentName: string;
  score1: number;
  score2: number;
  createdAt: string;
  player1: {
    id: number;
    username: string;
    email: string;
    wins: number;
    losses: number;
    score: number;
  };
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState("");

  async function fetchMatches() {
    try {
      const res = await fetch("/api/matches");

      if (!res.ok) {
        setError("Failed to fetch matches");
        return;
      }

      const data = await res.json();
      setMatches(data);
      setError("");
    } catch {
      setError("Server error while fetching matches");
    }
  }

  useEffect(() => {
    fetchMatches();
  }, []);

  async function createMatch() {
    const score1 = Math.floor(Math.random() * 10);
    const score2 = Math.floor(Math.random() * 10);

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        opponentType: "guest",
        opponentName: "Guest",
        score1,
        score2,
      }),
    });

    if (!res.ok) {
      setError("Failed to create match. Are you logged in?");
      return;
    }

    fetchMatches();
  }

function getWinnerText(match: any) {
  if (match.score1 > match.score2) {
    return `${match.player1.username} won`;
  }
  if (match.score2 > match.score1) {
    return `${match.opponentName} won`;
  }
  return "draw";
}

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Match History</h1>

      <button onClick={createMatch}>Simulate Match</button>

      {error && <p>{error}</p>}

      <ul>
        {matches.map((match) => (
          <li key={match.id}>
            {match.player1.username} {match.score1} - {match.score2} {match.opponentName} ({getWinnerText(match)})
          </li>
        ))}
      </ul>
    </div>
  );
}