import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { wins: "desc" },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      wins: true,
      losses: true,
    },
  });

  const response = users.map((u) => ({
    id: u.id,
    username: u.username ?? u.name ?? u.email?.split("@")[0] ?? "User",
    wins: u.wins,
    losses: u.losses,
  }));

  return NextResponse.json(response);
}
