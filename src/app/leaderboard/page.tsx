"use client";

import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);

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
        {users.map((user: any) => (
          <li key={user.id}>
            {user.username} — {user.wins} wins
          </li>
        ))}
      </ul>
    </div>
  );
}