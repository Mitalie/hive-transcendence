"use client";

import Link from "next/link";
import styles from "./NavBar.module.css";

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <Link href="/login">Login</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/leaderboard">Leaderboard</Link>
      <Link href="/game">Game</Link>
      <Link href="/matches">Matches</Link>
    </nav>
  );
}