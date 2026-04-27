"use client";

import PersonCard from "./PersonCard";

type Props = {
  friendshipId: string;
  label: string;
  avatarUrl: string;
  isOnline?: boolean;
  onSelect: () => void;
  isSelected: boolean;
};

export default function FriendCard({
  label,
  avatarUrl,
  isOnline,
  onSelect,
  isSelected,
}: Props) {
  return (
    <PersonCard
      label={label}
      avatarUrl={avatarUrl}
      isSelected={isSelected}
      online={isOnline ?? false}
      onClick={onSelect}
    />
  );
}
