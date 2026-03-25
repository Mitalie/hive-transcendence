import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: { id: "desc" },
    include: {
      player1: {
        select: {
          id: true,
          username: true,
          name: true,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid session user" },
        { status: 401 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
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
        player1Id: userId,
        opponentType,
        opponentName,
        score1,
        score2,
      },
    });

    if (score1 > score2) {
      await prisma.user.update({
        where: { id: userId },
        data: { wins: { increment: 1 } },
      });
    } else if (score2 > score1) {
      await prisma.user.update({
        where: { id: userId },
        data: { losses: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, match });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
