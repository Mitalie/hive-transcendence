"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("registration.errorFallback"));
      }

      sessionStorage.setItem(
        "pendingAuth",
        JSON.stringify({ email, password }),
      );

      if (data.needsProfile === false) {
        sessionStorage.removeItem("pendingAuth");
        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        });
      } else {
        router.push(`/registration/profile?userId=${data.userId}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("registration.errorUnexpected"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Gradient fills the rounded middle-content area from the layout */
    <div className="flex-1 h-full flex items-center justify-center p-4 sm:p-8">
      {/* Card uses theme variables — adapts to dark mode automatically */}
      <div className="w-full max-w-sm sm:max-w-md bg-card rounded-2xl p-6 sm:p-10 flex flex-col gap-5 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            {t("registration.title")}
          </h1>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text/70">
              {t("registration.emailLabel")}
            </label>
            <input
              type="email"
              placeholder={t("registration.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-transparent placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-text/30 transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text/70">
              {t("registration.passwordLabel")}
            </label>
            <input
              type="password"
              placeholder={t("registration.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-transparent placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-text/30 transition-all"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? t("registration.loading") : t("registration.submit")}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-text/15" />
          <span className="text-xs text-text/40">{t("registration.or")}</span>
          <div className="flex-1 h-px bg-text/15" />
        </div>

        <p className="text-center text-sm text-text/60">
          {t("registration.hasAccount")}{" "}
          <Link
            href="/login"
            className="text-text font-semibold hover:underline underline-offset-2"
          >
            {t("registration.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
