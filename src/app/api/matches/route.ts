// src/app/api/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// ✅ GET matches
export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: { id: "desc" },
    include: {
      player1: {
        select: {
          id: true,
          username: true,
          email: true,
          wins: true,
          losses: true,
          score: true,
        },
      },
    },
  });

  return NextResponse.json(matches);
}

// ✅ POST match
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const opponentType = body.opponentType;
    const opponentName = body.opponentName;
    const score1 = Number(body.score1);
    const score2 = Number(body.score2);

    if (
      !opponentType ||
      !opponentName ||
      Number.isNaN(score1) ||
      Number.isNaN(score2)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid match data" },
        { status: 400 },
      );
    }

    if (!["guest", "ai"].includes(opponentType)) {
      return NextResponse.json(
        { error: "Invalid opponent type" },
        { status: 400 },
      );
    }

    const match = await prisma.match.create({
      data: {
        player1Id: user.id,
        opponentType,
        opponentName,
        score1,
        score2,
      },
    });

    if (score1 > score2) {
      await prisma.user.update({
        where: { id: user.id },
        data: { wins: { increment: 1 } },
      });
    } else if (score2 > score1) {
      await prisma.user.update({
        where: { id: user.id },
        data: { losses: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, match });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
