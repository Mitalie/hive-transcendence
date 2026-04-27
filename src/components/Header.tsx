"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Bar from "@/components/Bar";
import NavButton from "@/components/NavButton";
import { SignInButton } from "./buttons/general-signin";
import { SignOutButton } from "@/components/buttons/sign-out-button";
import { useTranslation } from "react-i18next";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslation();

  const avatarSrc = session?.user
    ? `/api/avatar/${session.user.id}?v=${session.user.avatarVersion}`
    : "/images/user_icon.png";

  return (
    <Bar>
      {/* Website logo and name */}
      <Link
        href="/"
        className="flex items-center gap-3 no-underline text-inherit shrink-0"
      >
        <Image
          src="/images/website_logo.png"
          alt="logo"
          width={32}
          height={32}
          className="dark:invert"
        />
        {/* Name hidden on small screens, visible from md up */}
        <span className="hidden md:block text-2xl font-extrabold leading-none">
          {t("header.websitename")}
        </span>
      </Link>

      {/* Play button */}
      <Link href="/game" className="shrink-0">
        <button className="px-4 sm:px-8 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-dark to-purple-dark hover:opacity-90 transition-opacity whitespace-nowrap">
          <span className="hidden sm:inline">{t("header.play")}</span>
          {/* Small screen: just a play icon */}
          <svg
            className="sm:hidden w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </Link>

      {/* Nav buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <NavButton href="/friends" active={pathname === "/friends"}>
          <Image
            src="/images/friends_icon.png"
            alt="friends"
            width={32}
            height={32}
            className="rounded-full cursor-pointer dark:invert"
          />
        </NavButton>

        <NavButton href="/profile" active={pathname === "/profile"}>
          <Image
            unoptimized
            src={avatarSrc}
            alt="user"
            width={32}
            height={32}
            className={`rounded-full object-cover ${session ? "" : "dark:invert"}`}
          />
        </NavButton>

        {/* Sign in/out button depending on session */}
        {session?.user ? <SignOutButton /> : <SignInButton />}
      </div>
    </Bar>
  );
}
