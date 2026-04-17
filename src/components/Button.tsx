// components/Button.tsx
import { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ComponentProps<"button"> {
  children: ReactNode;
  className?: string;
}

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        "px-4 py-2 rounded-xl text-sm text-text transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
