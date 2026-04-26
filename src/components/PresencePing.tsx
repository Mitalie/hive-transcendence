"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { updatePresenceAction } from "@/actions/presence";

const PING_INTERVAL_MS = 60 * 1000;

export default function PresencePing() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    async function pingPresence() {
      await updatePresenceAction();
    }

    pingPresence();

    const intervalId = setInterval(pingPresence, PING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [status]);

  return null;
}
