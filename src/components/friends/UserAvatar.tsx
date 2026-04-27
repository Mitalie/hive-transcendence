"use client";

import Image from "next/image";

type Props = {
  label: string;
  avatarUrl: string;
  size?: "sm" | "md" | "lg";
};

export default function UserAvatar({ label, avatarUrl, size = "md" }: Props) {
  const sizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-14 h-14",
  };

  const pixelSizes = { sm: 28, md: 36, lg: 56 };

  return (
    <Image
      src={avatarUrl}
      alt={label}
      width={pixelSizes[size]}
      height={pixelSizes[size]}
      unoptimized
      className={`${sizes[size]} shrink-0 rounded-full object-cover`}
    />
  );
}
