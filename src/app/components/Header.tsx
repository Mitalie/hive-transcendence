// Page Header

/**
 * TODO
 * 1-CSS
 * 2-the logo is a placeholder, need to be updated by our own logo
 * 3-the three right links should be replaced by icon
 */ 

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();

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
      default:
        return "Default Page Title";
    }
  };

  return (
    <div
      className="header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        borderRadius: "12px",
        alignItems: "center"
      }}
    >
      {/* website logo and name */}
      <Link
        href="/"
        className="logo"
      >
        {/* Website Name */}
        <Image
          src="/images/website_logo.png"
          alt="logo"
          width={32}
          height={32}
        />
        <span className="logo-text">Website Name</span>
      </Link>

      {/* page name */}
      <div className="page-title">{getTitle()}</div>

      {/* buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <Link href="/game" className={`button ${pathname === "/game" ? "active" : ""}`}>
          Play
        </Link>
        <Link href="/friends" className={`button ${pathname === "/friends" ? "active" : ""}`}>
          Friends
        </Link>
        <Link href="/profile" className={`button ${pathname === "/profile" ? "active" : ""}`}>
          Profile
        </Link>
      </div>
    </div>
  );
}