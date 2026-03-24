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
import { GitSignInButton } from "@/components/buttons/github-signin";
import { SignOutButton } from "@/components/buttons/sign-out-button";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getTitle = () => {
    switch (pathname) {
      case "/":
        return "Home";
      case "/game":
        return "Game";
      case "/friends":
        return "Friends";
      case "/profile":
        return "Profile";
      case "/login":
        return "Login";
      case "/registration":
        return "Registration";
      default:
        return "Default Page Title";
    }
  };

  return (
    <Bar className="justify-between">
      {/* website logo and name */}
      <Link href="/" className="flex items-center gap-3 no-underline text-inherit">
        {/* Website Name */}
        <Image
          src="/images/website_logo.png"
          alt="logo"
          width={32}
          height={32}
        />
        <span className="text-2xl text-text font-extrabold leading-none">Website Name</span>
      </Link>

      {/* page name */}
      <div className="text-xl leading-none">{getTitle()}</div>

      {/* buttons */}
      <div className="flex items-center gap-2.5">
        <NavButton href="/game" active={pathname === "/game"}>
          Play
        </NavButton>

        <NavButton href="/friends" active={pathname === "/friends"}>
          Friends
        </NavButton>

        <NavButton href="/profile" active={pathname === "/profile"}>
          Profile
        </NavButton>

        {session?.user?.image && (
          <Image
            src={session.user.image}
            width={32}
            height={32}
            alt="avatar"
            className="rounded-full"
          />
        )}
        {/* Signin/out button depending if logged in */}
        {session ? <SignOutButton /> : <GitSignInButton />}
      </div>
    </Bar>
  );
}
