import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { apiErrors } from "@/lib/api-errors";

export async function POST(req: Request) {
  const { userId, displayName } = await req.json();

  if (!userId || !displayName?.trim()) {
    return NextResponse.json(
      { error: apiErrors.missingFields },
      { status: 400 },
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: userId }, { email: userId }],
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: apiErrors.userNotFound },
      { status: 404 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { displayName },
  });

  return NextResponse.json({ ok: true });
}
