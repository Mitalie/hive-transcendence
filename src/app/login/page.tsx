// src/app/login/page.tsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage(`Logged in as ${data.user.username}`);
    } else {
      setMessage(`Login failed: ${data.message}`);
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}

      <hr style={{ margin: "20px 0" }} />

      <button
        onClick={() => (window.location.href = "/api/auth/signin/github")}
        style={{ backgroundColor: "#24292f", color: "white", padding: "10px" }}
      >
        Login with GitHub
      </button>
    </div>
  );
}