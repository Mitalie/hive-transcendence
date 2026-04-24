"use client";

import { useEffect, useRef } from "react";

const PING_INTERVAL_MS = 30_000;

export default function PresencePing() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function pingPresence() {
      try {
        await fetch("/api/presence", {
          method: "POST",
        });
      } catch {}
    }

    pingPresence();

    const intervalId = setInterval(pingPresence, PING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
