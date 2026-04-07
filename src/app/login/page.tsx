"use client";

import { useState } from "react";
import Link from "next/link";
import { GitSignInButton } from "@/components/buttons/github-signin";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(t("login.error"));
      return;
    }

    if (!res?.error) {
      router.push("/");
    }
  };

  return (
    /* Gradient fills the rounded middle-content area from the layout */
    <div className="flex-1 h-full flex items-center justify-center p-4 sm:p-8">
      {/* Card uses theme variables*/}
      <div className="w-full max-w-sm sm:max-w-md bg-card rounded-2xl p-6 sm:p-10 flex flex-col gap-5 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            {t("login.title")}
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
              {t("login.emailLabel")}
            </label>
            <input
              type="email"
              placeholder={t("login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text/70">
              {t("login.passwordLabel")}
            </label>
            <input
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-dark to-purple-dark mt-1 text-white"
          >
            {loading ? t("login.loading") : t("login.submit")}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-text/15" />
          <span className="text-xs text-text/40">{t("login.or")}</span>
          <div className="flex-1 h-px bg-text/15" />
        </div>

        {/* GitHub OAuth */}
        <GitSignInButton />

        <p className="text-center text-sm text-text/60">
          {t("login.noAccount")}{" "}
          <Link
            href="/registration"
            className="text-text font-semibold hover:underline underline-offset-2"
          >
            {t("login.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
