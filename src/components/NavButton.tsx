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
        rounded-full
        text-text bg-btn-purple
        hover:bg-btn-purple-hover
        transition-colors duration-200
        ${active ? "bg-btn-purple-active pointer-events-none" : ""}
      `}
    >
      {children}
    </Link>
  );
}
