import { z } from "zod";

export const MatchSchema = z.object({
  player1: z.string(),
  player2: z.string(),
  score1: z.number().min(0),
  score2: z.number().min(0)
});

export type MatchInput = z.infer<typeof MatchSchema>;