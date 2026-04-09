"use client";

import { useTranslation } from "react-i18next";
import { sendFriendRequest } from "@/actions/friendships";

type Props = { userId: string; label: string };

export default function DiscoverUserCard({ userId, label }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between rounded-xl border border-purple-light p-4 gap-3">
      <p className="font-medium text-text text-sm truncate min-w-0">{label}</p>
      <button
        type="button"
        onClick={() => sendFriendRequest(userId)}
        className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-dark to-purple-dark hover:opacity-90 transition-opacity"
      >
        {t("friends.discover.addFriend")}
      </button>
    </div>
  );
}
