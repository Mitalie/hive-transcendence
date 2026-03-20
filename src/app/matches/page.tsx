"use client";

import { useEffect, useState } from "react";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);

  async function fetchMatches() {
    const res = await fetch("/api/matches");
    const data = await res.json();
    setMatches(data);
  }

  useEffect(() => {
    fetchMatches();
  }, []);

  async function createMatch() {
    await fetch("/api/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player1: "neo",
        player2: "trinity",
        score1: Math.floor(Math.random() * 10),
        score2: Math.floor(Math.random() * 10)
      })
    });

    fetchMatches();
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Match History</h1>

      <button onClick={createMatch}>
        Simulate Match
      </button>

      <ul>
        {matches.map((match: any) => (
          <li key={match.id}>
            {match.player1} {match.score1} - {match.score2} {match.player2}
            {" "} (winner: {match.winner})
          </li>
        ))}
      </ul>
    </div>
  );
}