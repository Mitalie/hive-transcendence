"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import type { ProfileData } from "../../app/profile/page";

export function ProfileClient({ data }: { data: NonNullable<ProfileData> }) {
  const { t } = useTranslation();
  const { user, stats, friendshipStats } = data;
  const displayName =
    user.displayName || user.username || user.name || t("profilePage.title");

  const recentMatches = user.matches.slice(0, 8);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6" suppressHydrationWarning>
      <div className="flex flex-col lg:flex-row gap-4 max-w-7xl w-full mx-auto min-h-full">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4 lg:w-80 xl:w-96 shrink-0">
          {/* Title card with avatar */}
          <div className="bg-card rounded-2xl border border-purple-light p-6 shadow-xl flex flex-col items-center gap-3 lg:flex-row lg:gap-4">
            <div className="w-16 h-16 rounded-xl border-2 border-purple-light bg-purple-light/20 flex items-center justify-center shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-text/50">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold text-text">
                {t("profilePage.title")}
              </h1>
              <p className="text-sm text-text/50 mt-1">
                {t("profilePage.subtitle")}
              </p>
            </div>
          </div>

          {/* Name + email + settings + bio */}
          <div className="bg-card rounded-2xl border border-purple-light p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0 flex flex-col items-center text-center">
                <p className="text-lg font-bold text-text truncate w-full text-center">
                  {displayName}
                </p>
                <p className="text-sm text-text/50 truncate w-full text-center">
                  {user.email || "-"}
                </p>
              </div>
              <Link href="/settings" className="shrink-0">
                <button className="p-4 rounded-lg text-text/40 hover:text-text hover:bg-purple-light/20 border border-transparent hover:border-purple-light transition-all">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </Link>
            </div>

            {/* Bio */}
            <div className="border-t border-purple-light pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-text/40 mb-1">
                {t("profilePage.bio")}
              </p>
              <p className="text-sm text-text/70 break-words whitespace-pre-wrap">
                {user.bio || t("profilePage.noBio")}
              </p>
            </div>
          </div>

          {/* Total stats */}
          <div className="bg-card rounded-2xl border border-purple-light p-6 shadow-xl flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40">
              {t("profilePage.totalStat")}
            </h2>
            <Row
              label={t("profilePage.stats.totalMatches")}
              value={stats.totalMatches}
            />
            <Row label={t("profilePage.stats.wins")} value={stats.wins} />
            <Row label={t("profilePage.stats.losses")} value={stats.losses} />
            <Row label={t("profilePage.stats.draws")} value={stats.draws} />
            <Row
              label={t("profilePage.stats.winRate")}
              value={`${stats.winRate}%`}
            />
            <div className="pt-1 border-t border-purple-light" />
            <Row
              label={t("profilePage.friendshipStats.accepted")}
              value={friendshipStats.acceptedFriends}
            />
            <Row
              label={t("profilePage.friendshipStats.pendingSent")}
              value={friendshipStats.pendingSent}
            />
            <Row
              label={t("profilePage.friendshipStats.pendingReceived")}
              value={friendshipStats.pendingReceived}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col bg-card rounded-2xl border border-purple-light p-6 shadow-xl min-h-64 min-w-0">
          {" "}
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40 mb-4 shrink-0">
            {t("profilePage.recentMatches.title")}
          </h2>
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-0">
            {recentMatches.length === 0 ? (
              <p className="text-sm text-text/50">
                {t("profilePage.recentMatches.noMatches")}
              </p>
            ) : (
              recentMatches.map((match) => {
                const resultKey =
                  match.score1 > match.score2
                    ? "win"
                    : match.score1 < match.score2
                      ? "loss"
                      : "draw";

                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between rounded-xl border border-purple-light px-4 py-3 gap-3 shrink-0"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-semibold text-text truncate">
                        {t("profilePage.recentMatches.you")}
                        <span className="text-text/40 mx-1.5 font-normal">
                          {t("profilePage.recentMatches.versus")}
                        </span>
                        {match.player2}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text/40">
                        <span>{match.matchDate}</span>
                        <span className="text-text/20">·</span>
                        <span>{match.matchTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-text/5 rounded-lg px-3 py-1.5">
                        <span className="text-sm font-bold text-text">
                          {match.score1}
                        </span>
                        <span className="text-text/30 text-xs mx-0.5">—</span>
                        <span className="text-sm font-bold text-text">
                          {match.score2}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          resultKey === "win"
                            ? "bg-green-500/10 text-green-600"
                            : resultKey === "loss"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-text/5 text-text/50"
                        }`}
                      >
                        {t(`profilePage.recentMatches.${resultKey}`)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text/60">{label}</span>
      <span className="font-semibold text-text">{value}</span>
    </div>
  );
}
