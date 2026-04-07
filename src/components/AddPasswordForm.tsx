"use client";
import { useState } from "react";
import Button from "./Button";

export function AddPasswordForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/add-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200">
        ✅ Password added! You can now log in with email too.
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="flex flex-col">
        <label htmlFor="password" className="text-sm text-gray-500">
          Choose a password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full mt-1">
        {loading ? "Saving..." : "Add password login"}
      </Button>
    </form>
  );
}
