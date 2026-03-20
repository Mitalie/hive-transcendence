// src/app/api/matches/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // Fetch all matches, newest first
  const matches = await prisma.match.findMany({
    orderBy: { id: "desc" },
  });
  return NextResponse.json(matches);
}

export async function POST(req: Request) {
  const { player1, player2, score1, score2 } = await req.json();

  if (!player1 || !player2 || score1 == null || score2 == null) {
    return NextResponse.json({ error: "Missing match data" }, { status: 400 });
  }

  let winner: string;
  if (score1 > score2) winner = player1;
  else if (score2 > score1) winner = player2;
  else winner = "Draw";

  const match = await prisma.match.create({
    data: { player1, player2, score1, score2, winner },
  });

  return NextResponse.json(match);
}