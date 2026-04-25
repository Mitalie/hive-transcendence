"use client";

import { useEffect, useRef } from "react";
import { updatePresenceAction } from "@/actions/presence";

const PING_INTERVAL_MS = 30_000;

export default function PresencePing() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function pingPresence() {
      await updatePresenceAction();
    }

    pingPresence();

    const intervalId = setInterval(pingPresence, PING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
