// Page Header

/**
 * TODO
 * 1-the logo is a placeholder, need to be updated by our own logo
 * 2-the three right links counld be replaced by icon
 */

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

  const getTitle = () => {
    switch (pathname) {
      case "/":
        return t("header.home");
      case "/game":
        return t("header.game");
      case "/friends":
        return t("header.friends");
      case "/profile":
        return t("header.profile");
      case "/login":
        return t("header.login");
      case "/registration":
        return t("header.registration");
      case "/terms":
        return t("header.terms_of_service");
      case "/privacy":
        return t("header.privacy");
      default:
        return t("header.default");
    }
  };

  return (
    <Bar>
      {/* website logo and name */}
      <Link
        href="/"
        className="flex items-center gap-3 no-underline text-inherit"
      >
        <Image
          src="/images/website_logo.png"
          alt="logo"
          width={32}
          height={32}
          className="dark:invert"
        />
        <span className="text-2xl font-extrabold leading-none">
          {t("header.websitename")}
        </span>
      </Link>

      {/* page name */}
      <div className="text-xl leading-none">{getTitle()}</div>

      {/* buttons */}
      <div className="flex items-center gap-2.5">
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
            src={session?.user?.image || "/images/user_icon.png"}
            alt="user"
            width={32}
            height={32}
            className={`
              rounded-full cursor-pointer
              ${!session?.user?.image ? "dark:invert" : ""}
            `}
          />
        </NavButton>

        {/* Signin/out button depending if logged in */}
        {session ? <SignOutButton /> : <SignInButton />}
      </div>
    </Bar>
  );
}
