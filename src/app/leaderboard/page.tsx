"use client";

import { useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  wins: number;
  losses: number;
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    }

    fetchUsers();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Leaderboard</h1>

      <ul>
        {users.map((user) => {
          const total = user.wins + user.losses;
          const winrate =
            total > 0 ? ((user.wins / total) * 100).toFixed(1) : "0.0";

          return (
            <li key={user.id}>
              {user.username} — {user.wins}W / {user.losses}L ({winrate}%)
            </li>
          );
        })}
      </ul>
    </div>
  );
}
