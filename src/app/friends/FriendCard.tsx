"use client";

import { useTranslation } from "react-i18next";
import { removeFriend } from "@/actions/friendships";

type Props = { friendshipId: string; label: string };

export default function FriendCard({ friendshipId, label }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between rounded-xl border border-purple-light p-4 gap-3">
      <p className="font-medium text-text text-sm truncate min-w-0">{label}</p>
      <button
        type="button"
        onClick={() => removeFriend(friendshipId)}
        className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-light hover:opacity-90 transition-opacity"
      >
        {t("friends.discover.remove")}
      </button>
    </div>
  );
}
