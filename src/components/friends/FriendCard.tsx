"use client";

import PersonCard from "./PersonCard";

type Props = {
  friendshipId: string;
  label: string;
  onSelect: () => void;
  isSelected: boolean;
};

export default function FriendCard({ label, onSelect, isSelected }: Props) {
  return (
    <PersonCard
      label={label}
      isSelected={isSelected}
      online={true}
      onClick={onSelect}
    />
  );
}
