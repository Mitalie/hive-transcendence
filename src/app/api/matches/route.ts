import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { player1, player2, score1, score2, winner } = body;

    if (
      !player1 ||
      !player2 ||
      !winner ||
      typeof score1 !== "number" ||
      typeof score2 !== "number"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const match = await prisma.match.create({
      data: {
        player1,
        player2,
        score1,
        score2,
        winner,
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error("POST /api/matches error:", error);
    return NextResponse.json(
      { error: "Failed to save match" },
      { status: 500 },
    );
  }
}
