"use client";

import { useTranslation } from "react-i18next";
import {
  acceptFriendRequest,
  declineFriendRequest,
} from "@/actions/friendships";

type Props = { friendshipId: string; label: string };

export default function IncomingRequestCard({ friendshipId, label }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between rounded-xl border border-purple-light p-4 gap-3">
      <p className="font-medium text-text truncate">{label}</p>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => acceptFriendRequest(friendshipId)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-dark to-purple-dark hover:opacity-90 transition-opacity"
        >
          {t("friends.discover.accept")}
        </button>
        <button
          type="button"
          onClick={() => declineFriendRequest(friendshipId)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-light hover:opacity-90 transition-opacity"
        >
          {t("friends.discover.decline")}
        </button>
      </div>
    </div>
  );
}
