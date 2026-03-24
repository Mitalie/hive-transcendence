import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { wins: "desc" },
    select: {
      id: true,
      username: true,
      wins: true,
      losses: true,
    },
  });

  return NextResponse.json(users);
}
