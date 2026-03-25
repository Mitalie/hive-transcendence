"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { GitSignInButton } from "@/components/buttons/github-signin";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isLogin) {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.ok) {
        window.location.href = "/";
      } else {
        setMessage("Login failed");
      }
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage(`Registered as ${data.user.username}. You can now log in.`);
      setIsLogin(true);
      setPassword("");
    } else {
      setMessage(data.message || "Register failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-card rounded-xl shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4">
        {isLogin ? "Login" : "Register"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="p-2 rounded border"
          type="text"
          placeholder={isLogin ? "Username or Email" : "Username"}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {!isLogin && (
          <input
            className="p-2 rounded border"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        <input
          className="p-2 rounded border"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-blue-600 text-white py-2 rounded">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}

      <p className="mt-4">
        {isLogin ? "No account?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="text-blue-500 underline"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage(null);
          }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>

      <div className="my-6 border-t pt-4">
        <p className="mb-2">Or continue with:</p>
        <GitSignInButton />
      </div>
    </div>
  );
}
