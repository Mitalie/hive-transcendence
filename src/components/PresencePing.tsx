"use client";

import { useEffect } from "react";

const PING_INTERVAL_MS = 30_000;

export default function PresencePing() {
  useEffect(() => {
    async function pingPresence() {
      try {
        await fetch("/api/presence", {
          method: "POST",
        });
      } catch (error) {
        console.error("Presence ping failed", error);
      }
    }

    pingPresence();

    const intervalId = setInterval(pingPresence, PING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
