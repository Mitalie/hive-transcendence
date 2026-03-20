// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { score: "desc" } // leaderboard by score
  });

  // Map database fields to API response
  const response = users.map(u => ({
    id: u.id,
    username: u.username,
    wins: u.score, // assuming score = wins
  }));

  return NextResponse.json(response);
}