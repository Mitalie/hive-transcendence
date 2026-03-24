"use client";

import { useEffect, useState } from "react";

type MeResponse = {
  loggedIn: boolean;
  user?: {
    id: number;
    username: string;
  };
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/me");
        const data: MeResponse = await res.json();

        if (data.loggedIn && data.user) {
          setIsLoggedIn(true);
          setCurrentUsername(data.user.username);
        } else {
          setIsLoggedIn(false);
          setCurrentUsername("");
        }
      } catch (err) {
        console.error(err);
      }
    }

    checkAuth();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const endpoint = isLogin ? "/api/login" : "/api/register";
    const body = isLogin
      ? { username, password }
      : { username, email, password };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.success) {
      setMessage(
        isLogin
          ? `Logged in as ${data.user.username}`
          : `Registered as ${data.user.username}`
      );

      if (isLogin) {
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } else {
      setMessage(`${isLogin ? "Login" : "Register"} failed: ${data.message}`);
    }
  }

  async function handleLogout() {
    const res = await fetch("/api/logout", {
      method: "POST",
    });

    const data = await res.json();

    if (data.success) {
      setIsLoggedIn(false);
      setCurrentUsername("");
      setMessage("Logged out successfully");
      window.location.href = "/login";
    } else {
      setMessage("Logout failed");
    }
  }

  if (isLoggedIn) {
    return (
      <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
        <h1>Account</h1>
        <p>You are logged in as <strong>{currentUsername}</strong></p>

        {message && <p style={{ marginTop: "20px" }}>{message}</p>}

        <button
          onClick={handleLogout}
          style={{
            padding: "10px",
            width: "100%",
            backgroundColor: "black",
            color: "white",
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h1>{isLogin ? "Login" : "Register"}</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}

      <p style={{ marginTop: "20px" }}>
        {isLogin ? "No account?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage(null);
          }}
          style={{
            color: "blue",
            textDecoration: "underline",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>

      <hr style={{ margin: "20px 0" }} />

      <button
        onClick={() => (window.location.href = "/api/auth/signin/github")}
        style={{
          backgroundColor: "#24292f",
          color: "white",
          padding: "10px",
          width: "100%",
        }}
      >
        Continue with GitHub
      </button>
    </div>
  );
}