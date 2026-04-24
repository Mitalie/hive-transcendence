"use server";

import {
  getRecentMatchesByUserId,
  getMatchStatsByUserId,
} from "@/data/matchHistory";

export async function getFriendMatchDataAction(userId: string) {
  const [matches, stats] = await Promise.all([
    getRecentMatchesByUserId(userId, 20),
    getMatchStatsByUserId(userId),
  ]);

  return {
    stats: {
      games: stats.totalMatches,
      wins: stats.wins,
      winRate: `${stats.winRate}%`,
    },
    matchHistory: matches.map((match) => {
      const result: "win" | "loss" =
        match.score1 > match.score2 ? "win" : "loss";

      return {
        id: match.id,
        opponent: match.player2,
        result,
        date: match.createdAt.toLocaleDateString(),
        score: `${match.score1} — ${match.score2}`,
      };
    }),
  };
}
