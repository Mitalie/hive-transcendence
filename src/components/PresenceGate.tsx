"use client";

import { useSession } from "next-auth/react";
import PresencePing from "@/components/PresencePing";

export default function PresenceGate() {
  const { status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  return <PresencePing />;
}
