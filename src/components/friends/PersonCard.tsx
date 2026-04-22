"use client";

import UserAvatar from "./UserAvatar";

type Props = {
  label: string;
  avatarUrl?: string | null;
  sublabel?: string;
  isSelected?: boolean;
  online?: boolean;
  onClick?: () => void;
  actions?: React.ReactNode;
};

export default function PersonCard({
  label,
  avatarUrl,
  sublabel,
  isSelected = false,
  online,
  onClick,
  actions,
}: Props) {
  return (
    <div
      onClick={onClick}
      style={{ minHeight: "64px" }}
      className={`flex items-center justify-between rounded-xl border border-purple-light px-4 gap-3 transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${isSelected ? "bg-purple-light/10 border-purple-dark" : "hover:bg-purple-light/10"}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <UserAvatar label={label} avatarUrl={avatarUrl} size="sm" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="font-medium text-text text-sm truncate">{label}</p>
            {sublabel && (
              <>
                <span className="text-text/30 text-sm shrink-0">|</span>
                <p className="text-sm text-text/50 truncate">{sublabel}</p>
              </>
            )}
          </div>
        </div>
        {online !== undefined && (
          <span
            className={`shrink-0 w-2 h-2 rounded-full ${
              online ? "bg-green-500" : "bg-text/20"
            }`}
          />
        )}
      </div>
      {actions && (
        <div
          className="flex gap-2 shrink-0 py-3"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
