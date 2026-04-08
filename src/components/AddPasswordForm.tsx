"use client";
import { useState } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";

export function AddPasswordForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
      const key = data.error;
      setError(t(`apiErrors.${key}`, t("addPassword.errorFallback")));
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="p-4 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 text-sm">
        {t("addPassword.success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-text/70">
          {t("addPassword.label")}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder={t("addPassword.placeholder")}
          className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="mt-1">
        {loading ? t("addPassword.loading") : t("addPassword.submit")}
      </Button>
    </form>
  );
}
