"use server";

import { SaveMatchArgs, saveMatch } from "@/data/matchHistory";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

function validateSaveMatchArgs(o: unknown): o is SaveMatchArgs {
  if (typeof o !== "object" || o === null) return false;
  if (!("player2" in o) || typeof o.player2 !== "string") return false;
  if (!("score1" in o) || typeof o.score1 !== "number") return false;
  if (!("score2" in o) || typeof o.score2 !== "number") return false;
  return true;
}

export type SaveMatchResult =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "invalid_args" | "unknown" };

export async function saveMatchAction(
  args: SaveMatchArgs,
): Promise<SaveMatchResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { ok: false, error: "unauthorized" };
  }
  if (!validateSaveMatchArgs(args)) {
    return { ok: false, error: "invalid_args" };
  }

  try {
    await saveMatch(session.user.id, args);
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}
