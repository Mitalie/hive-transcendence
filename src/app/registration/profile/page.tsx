"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { completeRegistrationProfileAction } from "@/actions/registration";

export default function ProfileSetupPage() {
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const pending = sessionStorage.getItem("pendingAuth");

      if (pending) {
        const { email, password } = JSON.parse(pending);

        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!signInResult || signInResult.error) {
          throw new Error(t("profile.errorUnexpected"));
        }

        sessionStorage.removeItem("pendingAuth");
      }

      const result = await completeRegistrationProfileAction(displayName);

      if (!result.ok) {
        const key = result.error;
        throw new Error(t(`apiErrors.${key}`, t("profile.errorFallback")));
      }

      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("profile.errorUnexpected"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-sm sm:max-w-md bg-card rounded-2xl p-6 sm:p-10 flex flex-col gap-5 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            {t("profile.title")}
          </h1>
          <p className="text-sm text-text/50 mt-1">{t("profile.subtitle")}</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text/70">
              {t("profile.displayNameLabel")}
            </label>
            <input
              type="text"
              placeholder={t("profile.displayNamePlaceholder")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm text-text bg-button border border-purple-light placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-purple-light transition-all"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-dark to-purple-dark mt-1 text-white"
          >
            {loading ? t("profile.loading") : t("profile.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
