"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { removeFriend } from "@/actions/friendships";
import UserAvatar from "./UserAvatar";

type MatchResult = "win" | "loss" | "draw";

type MatchHistoryItem = {
  id: string;
  opponent: string;
  result: MatchResult;
  date: string;
  score?: string;
};

type Stats = {
  games: number;
  wins: number;
  winRate: string;
};

type Props = {
  friend: { id: string; label: string; avatarUrl?: string | null };
  isFriend?: boolean;
  onClose: () => void;
  stats?: Stats;
  matchHistory?: MatchHistoryItem[];
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-button rounded-xl border border-purple-light p-4 flex flex-col items-center justify-center text-center gap-1">
      <p className="text-xs text-text/50 leading-tight break-words text-center w-full">
        {label}
      </p>
      <p className="text-2xl font-bold text-text">{value}</p>
    </div>
  );
}

function MatchRow({ match }: { match: MatchHistoryItem }) {
  const resultColors: Record<MatchResult, string> = {
    win: "text-green-400",
    loss: "text-red-400",
    draw: "text-text/50",
  };

  const resultLabels: Record<MatchResult, string> = {
    win: "W",
    loss: "L",
    draw: "D",
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-button border border-purple-light/40">
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-bold w-5 text-center ${resultColors[match.result]}`}
        >
          {resultLabels[match.result]}
        </span>
        <div>
          <p className="text-sm font-medium text-text leading-tight">
            vs {match.opponent}
          </p>
          <p className="text-xs text-text/40">{match.date}</p>
        </div>
      </div>
      {match.score && (
        <span className="text-sm font-semibold text-text/70">
          {match.score}
        </span>
      )}
    </div>
  );
}

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function FriendProfile({
  friend,
  isFriend = false,
  onClose,
  stats,
  matchHistory = [],
}: Props) {
  const { t } = useTranslation();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removePending, setRemovePending] = useState(false);

  async function handleRemove() {
    setRemovePending(true);
    setRemoveError(null);
    const result = await removeFriend(friend.id);
    setRemovePending(false);
    if ("error" in result) {
      setRemoveError(result.error);
      setConfirmRemove(false);
    }
  }

  const statCards = [
    {
      label: t("friends.profile.stats.games", { defaultValue: "Games" }),
      value: stats ? String(stats.games) : "—",
    },
    {
      label: t("friends.profile.stats.wins", { defaultValue: "Wins" }),
      value: stats ? String(stats.wins) : "—",
    },
    {
      label: t("friends.profile.stats.winRate", { defaultValue: "Win rate" }),
      value: stats ? stats.winRate : "—",
    },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 flex flex-col gap-5 lg:flex-1 lg:overflow-y-auto lg:min-h-0">
      {/* Top row: avatar + name + close button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <UserAvatar label={friend.label} avatarUrl={friend.avatarUrl} size="lg" />
          <div className="flex flex-col items-start">
            <h2 className="text-lg font-bold text-text leading-tight">
              {friend.label}
            </h2>
            <p className="text-sm text-text/40 leading-tight">
              {isFriend
                ? t("friends.profile.subtitle", { defaultValue: "Friend" })
                : t("friends.profile.subtitleStranger", {
                    defaultValue: "Player",
                  })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="rounded-lg p-2 text-text/40 hover:text-text hover:bg-purple-light/20 transition-colors shrink-0"
        >
          <CloseIcon className="w-6 h-6 text-text/50 hover:text-text" />
        </button>
      </div>

      {/* Stats — always visible */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(({ label, value }) => (
          <StatCard key={label} label={label} value={value} />
        ))}
      </div>

      {/* Match history — conditional */}
      <div className="flex flex-col gap-3 flex-1">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text/40">
          {t("friends.profile.matchHistory", { defaultValue: "Match History" })}
        </h3>

        {isFriend ? (
          matchHistory.length === 0 ? (
            <div className="rounded-xl border border-purple-light border-dashed p-8 flex items-center justify-center flex-1">
              <p className="text-sm text-text/40">
                {t("friends.profile.matchHistoryEmpty", {
                  defaultValue: "Match history coming soon",
                })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 flex-1">
              {matchHistory.map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </div>
          )
        ) : (
          /* Non-friend: locked state */
          <div className="rounded-xl border border-purple-light border-dashed p-8 flex flex-col items-center justify-center gap-3 flex-1">
            <div className="rounded-full bg-purple-light/20 p-3 text-text/30">
              <LockIcon className="w-7 h-7 text-purple-light" />
            </div>
            <p className="text-sm text-text/40 text-center">
              {t("friends.profile.matchHistoryLocked", {
                defaultValue: "Add as a friend to view match history",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Remove friend — only shown if actually friends */}
      {isFriend && (
        <div className="pt-4 border-t border-purple-light/40 flex flex-col gap-2">
          {removeError && (
            <p className="text-xs text-red-400 text-center">
              {t(`friendshipErrors.${removeError}`)}
            </p>
          )}
          {confirmRemove ? (
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={handleRemove}
                disabled={removePending}
                className="shrink-0 rounded-lg px-4 h-9 text-sm font-semibold text-white bg-red-light hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {t("friends.profile.removeConfirm", { defaultValue: "Remove" })}
              </button>
              <p className="flex-1 text-sm text-text/60 truncate">
                {t("friends.profile.removeConfirmText", {
                  defaultValue: "Remove {{name}} from friends?",
                  name: friend.label,
                })}
              </p>
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                className="shrink-0 rounded-lg px-4 h-9 text-sm font-semibold text-text border border-purple-light hover:bg-purple-light/20 transition-colors"
              >
                {t("friends.profile.removeCancel", { defaultValue: "Cancel" })}
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="rounded-lg px-4 h-9 text-sm font-semibold text-white bg-red-light hover:opacity-90 transition-opacity"
              >
                {t("friends.discover.remove")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}