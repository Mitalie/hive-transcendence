"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
} from "@/actions/friendships";
import PersonCard from "./PersonCard";

type RequestCardVariant = "incoming" | "sent";

type Props = {
  friendshipId: string;
  label: string;
  avatarUrl?: string | null;
  isSelected: boolean;
  variant: RequestCardVariant;
  onViewProfile: () => void;
  onSuccess?: () => void;
};

export default function RequestCard({
  friendshipId,
  label,
  avatarUrl,
  isSelected,
  variant,
  onViewProfile,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(
    fn: (id: string) => Promise<{ success: true } | { error: string }>,
  ) {
    setPending(true);
    setError(null);
    const result = await fn(friendshipId);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      onSuccess?.();
    }
  }

  const actions =
    variant === "incoming" ? (
      <>
        <button
          type="button"
          disabled={pending}
          onClick={() => handleAction(acceptFriendRequest)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-dark to-purple-dark hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {t("friends.discover.accept")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => handleAction(declineFriendRequest)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-red-light hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {t("friends.discover.decline")}
        </button>
      </>
    ) : (
      <button
        type="button"
        disabled={pending}
        onClick={() => handleAction(cancelFriendRequest)}
        className="rounded-lg px-4 py-2 text-sm font-semibold text-text border border-purple-light hover:bg-purple-light/20 transition-colors disabled:opacity-50"
      >
        {t("friends.discover.cancelRequest")}
      </button>
    );

  return (
    <div className="flex flex-col gap-1">
      <PersonCard
        label={label}
        avatarUrl={avatarUrl}
        isSelected={isSelected}
        onClick={onViewProfile}
        actions={actions}
      />
      {error && (
        <p className="text-xs text-red-400 px-4">
          {t(`friendshipErrors.${error}`)}
        </p>
      )}
    </div>
  );
}
