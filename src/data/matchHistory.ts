import { prisma } from "@/lib/prisma";

export async function getMatches() {
  return prisma.match.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getMatchesByUserId(player1Id: string) {
  return prisma.match.findMany({
    where: {
      player1Id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRecentMatchesByUserId(player1Id: string, take = 10) {
  const matches = await prisma.match.findMany({
    where: {
      player1Id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
    select: {
      id: true,
      player2: true,
      score1: true,
      score2: true,
      createdAt: true,
    },
  });

  return matches.map((match) => ({
    ...match,
    result:
      match.score1 > match.score2
        ? "Win"
        : match.score1 < match.score2
          ? "Loss"
          : "Draw",
  }));
}

export async function getMatchStatsByUserId(player1Id: string) {
  const matches = await prisma.match.findMany({
    where: {
      player1Id,
    },
    select: {
      score1: true,
      score2: true,
    },
  });

  const wins = matches.filter((match) => match.score1 > match.score2).length;
  const losses = matches.filter((match) => match.score1 < match.score2).length;
  const draws = matches.filter((match) => match.score1 === match.score2).length;
  const totalMatches = matches.length;

  const winRate =
    totalMatches === 0 ? "0.0" : ((wins / totalMatches) * 100).toFixed(1);

  return {
    totalMatches,
    wins,
    losses,
    draws,
    winRate,
  };
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
