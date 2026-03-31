import { prisma } from "@/lib/prisma";

export async function getMatches() {
  return prisma.match.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export interface SaveMatchArgs {
  player2: string;
  score1: number;
  score2: number;
}

export async function saveMatch(player1Id: string, args: SaveMatchArgs) {
  const { player2, score1, score2 } = args;

  await prisma.match.create({
    data: {
      player1Id,
      player2,
      score1,
      score2,
    },
  });
}
