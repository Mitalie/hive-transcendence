"use client";

import { useTranslation } from "react-i18next";
import { AddPasswordForm } from "@/components/AddPasswordForm";

interface SettingsClientProps {
  displayName: string | null;
  email: string | null;
  hasGithub: boolean;
  hasPassword: boolean;
  error: string | null;
}

export function SettingsClient({
  displayName,
  email,
  hasGithub,
  hasPassword,
  error,
}: SettingsClientProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 flex flex-col gap-6 text-left">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            {t("settings.title")}
          </h1>
          <p className="text-sm text-text/50 mt-1">{t("settings.subtitle")}</p>
        </div>

        {/* Account Section */}
        <section className="bg-bg border border-text/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-text/10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40">
              {t("settings.account.title")}
            </h2>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            <Field
              label={t("settings.account.displayName")}
              value={displayName ?? t("settings.notSet")}
            />
            <Field
              label={t("settings.account.email")}
              value={email ?? t("settings.notSet")}
            />
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-bg border border-text/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-text/10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40">
              {t("settings.security.title")}
            </h2>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text/60">
                {t("settings.security.passwordLogin")}
              </span>
              <StatusBadge
                enabled={hasPassword}
                connectedLabel={t("settings.badge.connected")}
                notSetLabel={t("settings.badge.notSet")}
              />
            </div>
            {hasGithub && !hasPassword && (
              <div className="pt-1">
                <AddPasswordForm />
              </div>
            )}
          </div>
        </section>

        {/* Connected Accounts Section */}
        <section className="bg-bg border border-text/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-text/10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40">
              {t("settings.connectedAccounts.title")}
            </h2>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            {error === "email_mismatch" && (
              <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {t("settings.connectedAccounts.emailMismatch")}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-text/70"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <p className="text-sm font-medium text-text">
                  {t("settings.connectedAccounts.github")}
                </p>
              </div>
              <StatusBadge
                enabled={hasGithub}
                connectedLabel={t("settings.badge.connected")}
                notSetLabel={t("settings.badge.notSet")}
              />
            </div>
            {!hasGithub && (
              <p className="text-sm text-text/60">
                {t("settings.connectedAccounts.githubHint")}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text/60">{label}</span>
      <span className="text-sm text-text font-medium">{value}</span>
    </div>
  );
}

function StatusBadge({
  enabled,
  connectedLabel,
  notSetLabel,
}: {
  enabled: boolean;
  connectedLabel: string;
  notSetLabel: string;
}) {
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
        enabled ? "bg-green-500/10 text-green-600" : "bg-text/5 text-text/40"
      }`}
    >
      {enabled ? connectedLabel : notSetLabel}
    </span>
  );
}
