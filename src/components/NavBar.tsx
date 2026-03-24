"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./NavBar.module.css";

type MeResponse = {
  loggedIn: boolean;
  user?: {
    id: number;
    username: string;
  };
};

export default function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/me");
        const data: MeResponse = await res.json();

        if (data.loggedIn && data.user) {
          setLoggedIn(true);
          setUsername(data.user.username);
        } else {
          setLoggedIn(false);
          setUsername("");
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchMe();
  }, []);

  async function handleLogout() {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setLoggedIn(false);
        setUsername("");
        window.location.href = "/login";
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
          <Link href="/game" className={styles.link}>
            Game
          </Link>
          <Link href="/matches" className={styles.link}>
            Matches
          </Link>
          <Link href="/leaderboard" className={styles.link}>
            Leaderboard
          </Link>
          <Link href="/profile" className={styles.link}>
            Profile
          </Link>
        </div>

        <div className={styles.right}>
          {loggedIn ? (
            <>
              <span className={styles.user}>Hello, {username}</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.link}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
