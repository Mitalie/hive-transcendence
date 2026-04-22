"use client";

type Props = {
  label: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

export default function UserAvatar({ label, avatarUrl, size = "md" }: Props) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <img
      src={avatarUrl ?? ""}
      alt={label}
      className={`${sizes[size]} shrink-0 rounded-full object-cover`}
    />
  );
}
