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

export async function saveMatchAction(args: SaveMatchArgs) {
  const session = await getServerSession(authOptions);

  if (!validateSaveMatchArgs(args)) {
    throw new Error("Invalid arguments to action");
  }

  if (!session?.user?.id) {
    return { saved: false, reason: "not_logged_in" };
  }

  await saveMatch(session.user.id, args);

  return { saved: true };
}
