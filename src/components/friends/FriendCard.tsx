"use client";

import PersonCard from "./PersonCard";

type Props = {
  friendshipId: string;
  label: string;
  avatarUrl?: string | null;
  onSelect: () => void;
  isSelected: boolean;
};

export default function FriendCard({ label, avatarUrl, onSelect, isSelected }: Props) {
  return (
    <PersonCard
      label={label}
      avatarUrl={avatarUrl}
      isSelected={isSelected}
      online={true}
      onClick={onSelect}
    />
  );
}
