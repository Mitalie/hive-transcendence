"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendFriendRequest } from "@/actions/friendships";
import PersonCard from "./PersonCard";

type Props = {
  userId: string;
  label: string;
  email?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onSuccess?: () => void;
};

export default function DiscoverUserCard({
  userId,
  label,
  email,
  isSelected = false,
  onSelect,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setPending(true);
    setError(null);
    const result = await sendFriendRequest(userId);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      onSuccess?.();
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <PersonCard
        label={label}
        sublabel={email}
        isSelected={isSelected}
        onClick={onSelect}
        actions={
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-dark to-purple-dark hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? "..." : t("friends.discover.addFriend")}
          </button>
        }
      />
      {error && (
        <p className="text-xs text-red-400 px-4">
          {t(`friendshipErrors.${error}`)}
        </p>
      )}
    </div>
  );
}
