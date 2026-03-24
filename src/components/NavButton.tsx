"use client";

import Link from "next/link";

type NavButtonProps = {
  href: string;
  children: React.ReactNode;
  active?: boolean;
};

export default function NavButton({
  href,
  children,
  active = false,
}: NavButtonProps) {
  return (
    <Link
      href={href}
      className={`
        px-4 py-2 rounded-xl
        bg-button text-text
        hover:bg-button-hover
        transition-colors duration-200
        ${active ? "bg-button-active pointer-events-none" : ""}
      `}
    >
      {children}
    </Link>
  );
}
