"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import type { ProfileData } from "./page";

export function ProfileClient({ data }: { data: NonNullable<ProfileData> }) {
  const { t } = useTranslation();
  const { user, stats, friendshipStats } = data;

  const displayName =
    user.displayName || user.username || user.name || t("profilePage.title");

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6">
      <div className="h-full flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-4 lg:w-80 xl:w-96 shrink-0">
          {/* Avatar + name + settings icon */}
          <div className="bg-card rounded-2xl border border-purple-light p-6 shadow-xl flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-purple-light bg-purple-light/20 flex items-center justify-center shrink-0 overflow-hidden">
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
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-text truncate">
                {displayName}
              </h1>
              <p className="text-sm text-text/50 truncate">
                {user.email || "-"}
              </p>
            </div>
            <Link href="/settings" className="shrink-0">
              <button className="p-2 rounded-lg text-text/40 hover:text-text hover:bg-purple-light/20 border border-transparent hover:border-purple-light transition-all">
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

          {/* Bio */}
          {user.bio && (
            <div className="bg-card rounded-2xl border border-purple-light p-6 shadow-xl">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-text/40 mb-2">
                {t("profilePage.bio")}
              </h2>
              <p className="text-sm text-text/70">{user.bio}</p>
            </div>
          )}

          {/* Start Play button */}
          <div className="mt-auto">
            <Link href="/game" className="w-full">
              <button className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-dark to-purple-dark hover:opacity-90 transition-opacity">
                {t("profilePage.startPlay")}
              </button>
            </Link>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Header */}
          <div className="bg-card rounded-2xl border border-purple-light p-6 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-1">
              {t("profilePage.gameHistory")}
            </h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-sm text-text/50">
              <span>
                {t("profilePage.accountDetails.joined")}: {user.joinedAt}
              </span>
              {user.lastActiveAt && (
                <>
                  <span>·</span>
                  <span>
                    {t("profilePage.accountDetails.lastActive")}:{" "}
                    {user.lastActiveAt}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Recent matches */}
          <div className="bg-card rounded-2xl border border-purple-light p-6 shadow-xl flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text">
                {t("profilePage.recentMatches.title")}
              </h2>
              <Link
                href="/matches"
                className="text-sm font-medium text-text/50 underline underline-offset-4 hover:text-text transition-colors"
              >
                {t("profilePage.recentMatches.seeAll")}
              </Link>
            </div>

            {user.matches.length === 0 ? (
              <p className="text-sm text-text/50">
                {t("profilePage.recentMatches.noMatches")}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {user.matches.map((match) => {
                  const resultKey =
                    match.score1 > match.score2
                      ? "win"
                      : match.score1 < match.score2
                        ? "loss"
                        : "draw";

                  return (
                    <div
                      key={match.id}
                      className="flex flex-col gap-2 rounded-xl border border-purple-light p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-text">
                          {t("profilePage.recentMatches.versus")}{" "}
                          {match.player2}
                        </p>
                        <p className="text-sm text-text/50">
                          {match.createdAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-text">
                          {match.score1} - {match.score2}
                        </p>
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
                })}
              </div>
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
