// components/Button.tsx
import { ComponentProps, ReactNode } from "react";

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
      className={`px-4 py-2 rounded-xl bg-button text-text hover:bg-button-hover transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
