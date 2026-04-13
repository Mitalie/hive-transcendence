"use client";

type Props = {
  label: string;
  size?: "sm" | "md" | "lg";
};

export default function UserAvatar({ label, size = "md" }: Props) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <div
      className={`${sizes[size]} shrink-0 rounded-full bg-gradient-to-br from-blue-dark to-purple-dark flex items-center justify-center`}
    >
      <span className="text-white font-bold select-none leading-none">
        {label.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
