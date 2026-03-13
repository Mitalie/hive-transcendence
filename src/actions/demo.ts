// Actions: server functions to be called from the frontend

"use server";

import { addMatchResult } from "@/data/demo"

export async function addMatchResultAction(formData: FormData) {
  // FIXME: input is untrusted, must validate
  const aiOpponent = Boolean(formData.get("aiOpponent"));

  if (aiOpponent)
    addMatchResult({
      userScore: Number(formData.get("userScore")),
      opponentScore: Number(formData.get("opponentScore")),
      aiOpponent,
    });
  else
    addMatchResult({
      userScore: Number(formData.get("userScore")),
      opponentScore: Number(formData.get("opponentScore")),
      aiOpponent,
      opponentName: String(formData.get("opponentName")),
    });
}
